import { z } from "zod";

const chatMessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: z.string().min(1).max(2000) }),
  z.object({
    role: z.literal("assistant"),
    // Headroom above what max_tokens (1024) can generate, so the model's own long replies survive
    // being replayed as history on the next turn. Still tighter than the original 10000.
    content: z.string().min(1).max(8000),
  }),
]);

// Per-message caps (above) bound a single message but not the whole conversation: 12 messages at the
// assistant cap of 8000 chars is ~96,000 characters, roughly 24k input tokens at ~4 chars/token —
// Groq bills the input side, and `max_tokens` in the route only bounds the OUTPUT. The real client
// (hooks/useChat.ts) caps history to the last 10 messages and the system prompt asks for 2-4 sentence
// replies, so a genuine multi-turn conversation normally totals a few thousand characters. 12,000
// characters (~3,000 input tokens) is roughly 2x that realistic ceiling — comfortable headroom for an
// actual conversation, while still rejecting the pathological near-max-length-every-message case
// before it ever reaches Groq.
const MAX_TOTAL_CHARS = 12000;

export const chatSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required.")
    .max(12, "Too many messages.")
    .superRefine((messages, ctx) => {
      // The final turn a client sends must be the user's — a client cannot end the payload on a
      // fabricated assistant turn to steer the next completion.
      if (messages[messages.length - 1]?.role !== "user") {
        ctx.addIssue("The last message must be from the user.");
      }

      // This route is stateless — there is no server-side session, so the client resends the whole
      // history on every turn, and every "assistant" message in that history is just
      // attacker-controlled text wearing an assistant label (nothing stops a caller from fabricating
      // one, e.g. to fake the model having already agreed to reveal something). We cannot verify
      // CONTENT without a server-side transcript, but we CAN constrain SHAPE: the real client
      // (hooks/useChat.ts) always sends a strictly alternating user/assistant sequence — each
      // assistant entry is either the hardcoded welcome message or a reply this same route streamed
      // back on a prior turn, and `nextMessages.slice(-10)` preserves that alternation because it's a
      // suffix of an alternating array. Rejecting any non-alternating sequence costs the real client
      // nothing while blocking a caller from stacking several fabricated assistant turns back to back
      // (e.g. two "assistant" messages in a row, or a long run of fake agreements) to steer the
      // model. It does NOT stop a single well-placed fake assistant turn interleaved between real
      // user turns — closing that fully requires the server to own the transcript, which this
      // stateless route intentionally does not do.
      for (let i = 1; i < messages.length; i++) {
        if (messages[i]?.role === messages[i - 1]?.role) {
          ctx.addIssue("Messages must alternate between user and assistant.");
          break;
        }
      }

      const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
      if (totalChars > MAX_TOTAL_CHARS) {
        ctx.addIssue(
          `Conversation is too long (max ${MAX_TOTAL_CHARS} characters total).`
        );
      }
    }),
});

export type ChatRequest = z.infer<typeof chatSchema>;
