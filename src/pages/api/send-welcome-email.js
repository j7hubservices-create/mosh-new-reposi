import { sendEmail } from "@/lib/email";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Mosh Apparels!",
        html: `<p>Hi ${name},</p><p>Thank you for signing up! We're thrilled to have you at Mosh Apparels.</p>`,
      });

      return res.status(200).json({ message: "Email sent" });
    } catch (error) {
      console.error("Failed to send email:", error);
      return res.status(500).json({ message: "Failed to send email" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
