import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import axios from "axios";

export async function POST(request) {
  try {
    const { username, email, password, captchaToken } = await request.json();

    console.log("Received captchaToken on server:", captchaToken);

    // ✅ 1. Check if CAPTCHA token is present
    if (!captchaToken) {
      return new Response(JSON.stringify({ error: "Captcha is required" }), { status: 400 });
    }

    // ✅ 2. Verify CAPTCHA with Google's API
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

    // ✅ 3. Check for existing user (by username or email)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username or email already exists" }), { status: 400 });
    }

    // ✅ 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 5. Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // ✅ 6. Respond with success
    return new Response(JSON.stringify({ success: true, user }), { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 500 });
  }
}
