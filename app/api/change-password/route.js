import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import zxcvbn from 'zxcvbn';
import { logActivity } from '@/lib/logActivity'; // ✅ Import logActivity

export async function POST(request) {
    try {
        const { userId, currentPassword, newPassword, token } = await request.json();

        // ✅ Basic Validation
        if (!userId) return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
        if (!currentPassword) return new Response(JSON.stringify({ error: 'Missing current password' }), { status: 400 });
        if (!newPassword) return new Response(JSON.stringify({ error: 'Missing new password' }), { status: 400 });

        // ✅ Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
        }

        // ✅ Check if current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return new Response(JSON.stringify({ error: 'Current password is incorrect.' }), { status: 401 });
        }

        // ✅ Prevent using same password
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return new Response(JSON.stringify({ error: 'New password must be different from the current one.' }), { status: 400 });
        }

        // Optional: Log strength or give user feedback
        const strength = zxcvbn(newPassword);

        // ✅ If 2FA is enabled, verify TOTP token
        if (user.isTwoFactorEnabled) {
            if (!token) {
                return new Response(JSON.stringify({ error: '2FA code required.' }), { status: 401 });
            }

            const isTokenValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 1,
            });

            if (!isTokenValid) {
                return new Response(JSON.stringify({ error: 'Invalid 2FA code.' }), { status: 401 });
            }
        }

        // ✅ Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                loginAttempts: 0,
                lockedUntil: null,
            },
        });

        // ✅ Log the activity
        await logActivity(userId, 'Changed Password');

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Change password error:', error);
        return new Response(JSON.stringify({ error: 'Server error.' }), { status: 500 });
    }
}
