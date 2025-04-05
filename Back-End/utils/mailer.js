import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmail({ name, email, subject, message }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const options = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `Query: ${subject}`,
    text: `From: ${name}\nEmail: ${email}\n\n${message}`,
  };

  try {
    await transporter.sendMail(options);
    return true;
  } catch (err) {
    console.error("❌ Email error:", err);
    return false;
  }
}
