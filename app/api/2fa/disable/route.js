import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/logActivity';
import { sendEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return new Response(JSON.stringify({ error: 'Missing user ID or token.' }), { status: 400 });
    }

    // Fetch user with 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return new Response(JSON.stringify({ error: '2FA is not enabled for this user.' }), { status: 400 });
    }

    // Verify token
    const speakeasy = require('speakeasy');
    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isVerified) {
      return new Response(JSON.stringify({ error: 'Invalid token. Please try again.' }), { status: 401 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Log the activity
    console.log('Calling logActivity...');
    await logActivity(userId, 'Disabled 2FA');
    console.log('logActivity call finished');

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'Two-Factor Authentication Disabled',
      html: `
        <h2>2FA Disabled</h2>
        <p>Your account's Two-Factor Authentication was <strong>disabled</strong> on <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>If you did not do this, please secure your account immediately or contact support.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: '2FA disabled successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return new Response(JSON.stringify({ error: 'Server error while disabling 2FA.' }), { status: 500 });
  }
}
