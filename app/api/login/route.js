import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logActivity';

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(request) {
  try {
    const { user, password, recaptchaToken } = await request.json();

    if (!user || !password || !recaptchaToken) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    // reCAPTCHA Verification
    const captchaVerify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    });

    const captchaResult = await captchaVerify.json();

    if (!captchaResult.success || (captchaResult.score !== undefined && captchaResult.score < 0.5)) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA verification failed' }), { status: 403 });
    }

    // Lookup user by email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user }, { username: user }],
      },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Check if account is locked
    const now = new Date();
    if (
      existingUser.loginAttempts >= 5 &&
      existingUser.lockedUntil &&
      now < new Date(existingUser.lockedUntil)
    ) {
      const remainingTime = Math.ceil((new Date(existingUser.lockedUntil) - now) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Account locked. Try later.',
          locked: true,
          remainingTime,
        }),
        { status: 403 }
      );
    }

    // Validate password
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      const newAttempts = existingUser.loginAttempts + 1;
      const lockoutThreshold = 5;
      const lockDurationMs = 5 * 60 * 1000; // 5 minutes
      const lockedUntil = newAttempts >= lockoutThreshold ? new Date(Date.now() + lockDurationMs) : null;

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: lockedUntil || existingUser.lockedUntil,
        },
      });

      await logActivity(existingUser.id, 'Failed Login Attempt');

      return new Response(JSON.stringify({
        error: 'Invalid password',
        attemptsLeft: Math.max(lockoutThreshold - newAttempts, 0),
        ...(lockedUntil && { lockedUntil }),
      }), { status: 401 });
    }

    // On success: reset attempts
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // 2FA Handling
    if (existingUser.isTwoFactorEnabled && existingUser.twoFactorSecret) {
      return new Response(JSON.stringify({
        twoFactorRequired: true,
        userId: existingUser.id,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
        },
      }), { status: 200 });
    }

    // Log successful login
    await logActivity(existingUser.id, 'Login');

    return new Response(JSON.stringify({
      success: true,
      userId: existingUser.id,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
      },
    }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
