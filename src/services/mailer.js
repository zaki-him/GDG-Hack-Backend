// src/services/mailer.js
import fetch from "node-fetch";

export async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "hi@hireflow.ai",
      to: [to],
      subject,
      html,
    }),
  });
  return res.json();
}
