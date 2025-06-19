import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import axios from "axios";

export async function POST(request) {
  try {
    const { username, email, password, captchaToken } = await request.json();

    console.log("Received captchaToken on server:", captchaToken);

    if (!captchaToken) {
      return new Response(JSON.stringify({ error: "Captcha is required" }), { status: 400 });
    }

    const captchaRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captchaToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!captchaRes.data.success) {
      return new Response(JSON.stringify({ error: "Captcha verification failed" }), { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username or email already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        isTwoFactorEnabled: false,      
        twoFactorSecret: null           
      },
    });

    return new Response(JSON.stringify({ success: true, user }), { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 500 });
  }
}
