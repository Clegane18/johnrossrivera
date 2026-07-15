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

export const chatSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required.")
    .max(12, "Too many messages.")
    // The final turn a client sends must be the user's — a client cannot end the payload on a
    // fabricated assistant turn to steer the next completion.
    .refine((m) => m[m.length - 1]?.role === "user", {
      message: "The last message must be from the user.",
    }),
});

export type ChatRequest = z.infer<typeof chatSchema>;
