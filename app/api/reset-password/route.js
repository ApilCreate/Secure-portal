import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logActivity"; // Import the logger

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return new Response(JSON.stringify({ error: "Missing token or password." }), { status: 400 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
    }

    const userId = decoded.userId;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
    }

    // Check against old password hashes
    const oldHashes = await prisma.passwordHistory.findMany({
      where: { userId },
    });

    for (const entry of oldHashes) {
      const match = await bcrypt.compare(password, entry.hash);
      if (match) {
        return new Response(
          JSON.stringify({ error: " Please choose a different password — reuse not allowed." }),
          { status: 400 }
        );
      }
    }

    // Store current password hash in history
    await prisma.passwordHistory.create({
      data: {
        userId,
        hash: user.password, // Store old password
      },
    });

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        isVerified: true,
      },
    });

    // Log the reset password action
    await logActivity(userId, "Reset Password");

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
