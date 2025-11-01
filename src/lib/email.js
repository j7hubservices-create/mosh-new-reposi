import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

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
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
