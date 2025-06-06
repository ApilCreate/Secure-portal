import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "All fields are required." }), { status: 400 });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username or email already exists." }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        passwordHistory: JSON.stringify([hashedPassword]),
        isVerified: false,
      },
    });

    return new Response(JSON.stringify({ success: true, user }), { status: 201 });

  } catch (error) {
    console.error("Register error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
