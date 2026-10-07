import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { addMinutes } from "date-fns";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: "User already registered with this email" }), { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = addMinutes(new Date(), 10);

    await prisma.emailVerification.upsert({
      where: { email },
      update: { otp, otpExpiry: expiry },
      create: { email, otp, otpExpiry: expiry },
    });

    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    });

    return new Response(JSON.stringify({ success: true, message: "OTP sent to email." }), { status: 200 });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
