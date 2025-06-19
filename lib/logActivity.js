import prisma from '@/lib/prisma';

export async function logActivity(userId, action) {
  if (!userId || !action) return;

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
