import Resend from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  return await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    reply_to: process.env.REPLY_TO_EMAIL,
    subject,
    html,
  });
}
