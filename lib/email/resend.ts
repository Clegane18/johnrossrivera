import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({
  name,
  email,
  message,
  toEmail,
}: {
  name: string;
  email: string;
  message: string;
  toEmail: string;
}): Promise<void> {
  await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: toEmail,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });
}

export default resend;
