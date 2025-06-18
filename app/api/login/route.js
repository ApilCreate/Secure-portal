import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logActivity';

export async function POST(request) {
  try {
    const { user, password } = await request.json();

    if (!user || !password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user }, { username: user }],
      },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Account lockout check
    if (
      existingUser.loginAttempts >= 5 &&
      existingUser.lockedUntil &&
      new Date() < new Date(existingUser.lockedUntil)
    ) {
      return new Response(JSON.stringify({ error: 'Account locked. Try later.' }), { status: 403 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          loginAttempts: { increment: 1 },
          lockedUntil:
            existingUser.loginAttempts + 1 >= 5
              ? new Date(Date.now() + 5 * 60 * 1000)
              : existingUser.lockedUntil,
        },
      });

      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    // ✅ Reset login attempts after successful login
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // ✅ If 2FA is enabled, require code first
    if (existingUser.isTwoFactorEnabled && existingUser.twoFactorSecret) {
      return new Response(
        JSON.stringify({
          twoFactorRequired: true,
          userId: existingUser.id,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
            isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
          },
        }),
        { status: 200 }
      );
    }

    // ✅ Log the successful login activity
    await logActivity(existingUser.id, 'Login');

    // ✅ Return user data
    return new Response(
      JSON.stringify({
        success: true,
        userId: existingUser.id,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
        },
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
