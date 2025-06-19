import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/logActivity'; 

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
console.log(' Calling logActivity...');
await logActivity(userId, 'Disabled 2FA');
console.log(' logActivity call finished');

    // Log the activity
    await logActivity(userId, 'Disabled 2FA');

    return new Response(JSON.stringify({ success: true, message: '2FA disabled successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return new Response(JSON.stringify({ error: 'Server error while disabling 2FA.' }), { status: 500 });
  }
  
}
