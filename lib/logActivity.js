import prisma from '@/lib/prisma';

export async function logActivity(userId, action) {
  console.log('📦 Inside logActivity:', { userId, action });
  try {
    await prisma.ActivityLog.create({  
      data: {
        userId,
        action,
      },
    });
    console.log('✅ Activity log created in DB');
  } catch (err) {
    console.error('❌ Failed to log activity:', err);
  }
}
