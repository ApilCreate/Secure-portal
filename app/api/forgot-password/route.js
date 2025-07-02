import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "No account found with that email." }), { status: 404 });
    }

    // Generate token valid for 15 minutes
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.username},</p>
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
