import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logActivity";

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

    // Check against last 3 password hashes
    const oldPasswords = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    for (const entry of oldPasswords) {
      const match = await bcrypt.compare(password, entry.hash);
      if (match) {
        return new Response(
          JSON.stringify({ error: "Please choose a different password — reuse not allowed." }),
          { status: 400 }
        );
      }
    }

    // Store current password in history before updating
    await prisma.passwordHistory.create({
      data: {
        userId,
        hash: user.password,
      },
    });

    // Clean up older password entries (keep only last 3)
    const allEntries = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: 3,
    });

    const oldIds = allEntries.map((entry) => entry.id);
    if (oldIds.length > 0) {
      await prisma.passwordHistory.deleteMany({
        where: { id: { in: oldIds } },
      });
    }

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
