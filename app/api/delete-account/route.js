import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logActivity';
import { sendAccountDeletionEmail } from '@/lib/sendEmail';

export async function POST(request) {
  try {
    const { userId, token, password } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // If 2FA is NOT enabled, verify password
    if (!user.isTwoFactorEnabled) {
      if (!password) {
        return new Response(JSON.stringify({ error: "Password required" }), { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return new Response(JSON.stringify({ error: "Incorrect password" }), { status: 401 });
      }
    }

    // If 2FA is enabled, verify token
    if (user.isTwoFactorEnabled) {
      if (!token) {
        return new Response(JSON.stringify({ error: "2FA code required" }), { status: 400 });
      }

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

    // Send confirmation email
    await sendAccountDeletionEmail(user.email, user.username);

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error(" Delete account error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
