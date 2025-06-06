import prisma from "@/lib/prisma";
import speakeasy from "speakeasy";

export async function POST(request) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ error: "Missing userId or token." }),
        { status: 400 }
      );
    }

    // Fetch user and check if 2FA is set
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return new Response(
        JSON.stringify({ error: "2FA not set up or user not found." }),
        { status: 404 }
      );
    }

    // Verify the token
    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1, // accepts token ±30s
    });

    if (!isVerified) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired code." }),
        { status: 401 }
      );
    }

    // ✅ Optional: Only enable 2FA if this is the setup phase
    if (!user.isTwoFactorEnabled) {
      await prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true },
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("2FA verify error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), {
      status: 500,
    });
  }
}
