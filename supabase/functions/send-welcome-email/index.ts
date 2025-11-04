import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req) => {
  try {
    const { email, name } = await req.json();

    const data = await resend.emails.send({
      from: "Mosh Apparels <noreply@moshapparels.com>",
      to: email,
      subject: "Welcome to Mosh Apparels 👕",
      reply_to: "moshapparelsofficial@gmail.com",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px;">
          <div style="max-width: 600px; background: #fff; border-radius: 8px; padding: 30px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #222;">Hey ${name || "there"}, welcome to <span style="color:#e63946;">Mosh Apparels</span>!</h2>
            <p>We’re thrilled to have you with us. Your style journey just got better 🎉</p>
            <p>From exclusive fashion drops to limited deals, we’ve got you covered.</p>
            <p style="margin-top: 30px;">💌 Have any questions? Just reply to this email!</p>
            <p style="margin-top: 40px; color: #888;">— The Mosh Apparels Team</p>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
