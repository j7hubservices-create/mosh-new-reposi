export async function sendEmail({ name, email }) {
  const response = await fetch("/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });

  const data = await response.json();
  return data;
}
