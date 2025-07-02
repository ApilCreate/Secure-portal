import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import zxcvbn from "zxcvbn";
import { logActivity } from "@/lib/logActivity";
import { sendEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword, token } =
      await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return new Response(
        JSON.stringify({ error: "Current password is incorrect." }),
        { status: 401 }
      );
    }

    // Check against previous password history (last 3)
    const previousPasswords = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    for (const entry of previousPasswords) {
      const reused = await bcrypt.compare(newPassword, entry.hash);
      if (reused) {
        return new Response(
          JSON.stringify({
            error: "New password must not match your recent 3 passwords.",
          }),
          { status: 400 }
        );
      }
    }

    // Optional: check strength
    const strength = zxcvbn(newPassword);

    // 2FA verification
    if (user.isTwoFactorEnabled) {
      if (!token) {
        return new Response(JSON.stringify({ error: "2FA code required." }), {
          status: 401,
        });
      }

      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!isTokenValid) {
        return new Response(JSON.stringify({ error: "Invalid 2FA code." }), {
          status: 401,
        });
      }
    }

    // Save current password to history
    await prisma.passwordHistory.create({
      data: {
        userId,
        hash: user.password,
      },
    });

    // Keep only latest 3 entries
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
    // Count today's password changes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const changesToday = await prisma.passwordHistory.count({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (changesToday >= 2) {
      return NextResponse.json(
        { error: "You can only change your password twice a day." },
        { status: 400 }
      );
    }

    // Update user password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await logActivity(userId, "Changed Password");

    await sendEmail({
      to: user.email,
      subject: "Your Password Has Been Changed",
      html: `
        <h2>Password Change Successful</h2>
        <p>Your account password was successfully changed on <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>If this wasn’t you, please reset your password immediately or contact support.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), {
      status: 500,
    });
  }
}
