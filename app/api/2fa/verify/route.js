import prisma from "@/lib/prisma";
import speakeasy from "speakeasy";
import { logActivity } from "@/lib/logActivity"; 

export async function POST(request) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ error: "Missing userId or token." }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found." }),
        { status: 404 }
      );
    }

    if (!user.twoFactorSecret) {
      return new Response(
        JSON.stringify({ error: "2FA is not set up for this user." }),
        { status: 400 }
      );
    }

    // Debugging logs
    console.log("🔐 DEBUG: Verifying 2FA");
    console.log("👉 userId:", userId);
    console.log("👉 token entered:", token);
    console.log("👉 stored secret:", user.twoFactorSecret);

    const expected = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: "base32"
    });
    console.log("👉 expected token (current):", expected);

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1, // Accepts ±30s
    });

    if (!isVerified) {
      return new Response(
        JSON.stringify({ error: "Invalid 2FA code." }),
        { status: 401 }
      );
    }

    // Enable 2FA if not already enabled
    if (!user.isTwoFactorEnabled) {
      await prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true },
      });

      // Log activity
      await logActivity(userId, 'Enabled 2FA');
    }

    // Return safe user info including 2FA flag
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isTwoFactorEnabled: true,
        },
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error(" 2FA verification failed:", error);
    return new Response(
      JSON.stringify({ error: "Server error during verification." }),
      { status: 500 }
    );
  }
}
