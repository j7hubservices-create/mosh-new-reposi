import { Resend } from "resend";

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY);

export async function sendEmail({ name, email }) {
  try {
    await resend.emails.send({
      from: "Mosh Apparels <support@moshapparels.com>",
      to: email,
      subject: "Welcome to Mosh Apparels!",
      html: `
        <p>Hi ${name || "there"},</p>
        <p>Thank you for signing up! We're thrilled to have you as part of Mosh Apparels.</p>
        <p>Stay tuned for updates, new arrivals, and special offers.</p>
        <p>Best regards,<br>The Mosh Apparels Team</p>
      `,
      reply_to: "moshapparelsofficial@gmail.com",
    });

    console.log("✅ Email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error: error.message };
  }
}
