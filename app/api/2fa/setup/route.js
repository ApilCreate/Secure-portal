import prisma from "@/lib/prisma";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user ID." }), { status: 400 });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `SecurePortal (${userId})`, // shows up in Google Auth app
    });

    // Save secret to user's record
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    // Convert secret to QR code
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    return new Response(JSON.stringify({ qr: qrCodeDataURL }), {
      status: 200,
    });

  } catch (error) {
    console.error("2FA setup error:", error);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
