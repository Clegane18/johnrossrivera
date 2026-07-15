import { z } from "zod";

// Input contract for the live API-playground echo endpoint. Kept in lib/validations so the same
// schema could be shared with a client form, mirroring the contact + chat flows.
export const demoEchoSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required.")
    .max(200, "Keep it under 200 characters."),
});

export type DemoEchoRequest = z.infer<typeof demoEchoSchema>;
