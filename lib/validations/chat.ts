import { z } from "zod";

const chatMessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: z.string().min(1).max(2000) }),
  z.object({
    role: z.literal("assistant"),
    content: z.string().min(1).max(10000),
  }),
]);

export const chatSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required.")
    .max(20, "Too many messages."),
});

export type ChatRequest = z.infer<typeof chatSchema>;
