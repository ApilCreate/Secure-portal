import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import { logActivity } from '@/lib/logActivity';

export async function POST(request) {
  try {
    const { userId, token } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    //  If 2FA is enabled, verify token
    if (user.isTwoFactorEnabled) {
      if (!token) {
        return new Response(JSON.stringify({ error: "2FA code required" }), { status: 400 });
      }

      console.log("🗑️ DEBUG: Deleting account with 2FA");
      console.log("👉 userId:", userId);
      console.log("👉 token entered:", token);
      console.log("👉 stored secret:", user.twoFactorSecret);

      const expected = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: "base32"
      });
      console.log("👉 expected token (current):", expected);

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid 2FA code" }), { status: 401 });
      }
    }

    // Log activity BEFORE deletion
    await logActivity(userId, 'Deleted Account');

    //  Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(" Delete account error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
