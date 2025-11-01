export async function sendEmail({ name, email }) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    // Debug output to confirm success/failure
    if (!response.ok) {
      console.error("❌ Email API failed:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    console.log("✅ Email API response:", data);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error: error.message };
  }
}
