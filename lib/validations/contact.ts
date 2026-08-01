import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
  // Honeypot: a field a real visitor never sees or fills. The form component must render an input
  // named "company" that is visually hidden from sighted users (not `display:none`/`hidden` alone —
  // some bots skip those — prefer off-screen positioning), unreachable by keyboard (`tabIndex={-1}`),
  // and excluded from assistive tech (`aria-hidden="true"`), with `autoComplete="off"` so password
  // managers don't fill it either. `.optional()` (not `.default()`) on purpose: `.default()` makes
  // the parsed OUTPUT type required (`string`, never `undefined`), which react-hook-form's
  // `zodResolver` then can't reconcile with the schema's optional INPUT type — it would fail to
  // typecheck against the existing, untouched form component. `.optional()` keeps input and output
  // types identical (`string | undefined`) so nothing downstream needs to change. The ROUTE checks
  // this value — any truthy (non-empty) value means something other than a human filled it in.
  company: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
