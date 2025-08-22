import nodemailer from "nodemailer";
import { generateWelcomeEmailHtml } from "../lib/generateWelcomeHtml";

export async function sendWelcomeEmail(
  student: { name: string; email: string; password: string },
  teacher: { name: string }
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Notoria: Educação sem complicação" <${process.env.GMAIL_USER}>`,
    to: student.email,
    subject: "Bem-vindo ao Notoria!",
    html: generateWelcomeEmailHtml(
      student.name,
      student.email,
      teacher.name,
      student.password
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
}
