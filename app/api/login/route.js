import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logActivity';

// Add this for reCAPTCHA secret (store securely in env)
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(request) {
  try {
    const { user, password, recaptchaToken } = await request.json();

    // Basic field check
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

    // Check user by email or username
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

    // Password check
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

    // Reset login attempts
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // If 2FA is enabled, ask for token
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

    // Log successful login
    await logActivity(existingUser.id, 'Login');

    // Return success with user data
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
