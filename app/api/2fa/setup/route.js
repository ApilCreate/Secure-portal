import prisma from "@/lib/prisma";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID." }),
        { status: 400 }
      );
    }

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `SecurePortal`, // App name shown in Google Authenticator
    });

    // Save secret to the user's record in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    // Generate a QR code from the secret
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    return new Response(
      JSON.stringify({ qr: qrCodeDataURL }),
      { status: 200 }
    );

  } catch (error) {
    console.error(" 2FA Setup Error:", error);
    return new Response(
      JSON.stringify({ error: "Server error while generating QR code." }),
      { status: 500 }
    );
  }
}
