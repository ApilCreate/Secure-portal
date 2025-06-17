import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP are required." }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.otp || !user.otpExpiry) {
      return new Response(JSON.stringify({ error: "No OTP found for this email." }), { status: 400 });
    }

    const now = new Date();
    if (user.otp !== otp) {
      return new Response(JSON.stringify({ error: "Invalid OTP." }), { status: 400 });
    }

    if (user.otpExpiry < now) {
      return new Response(JSON.stringify({ error: "OTP has expired." }), { status: 400 });
    }

    // ✅ OTP is valid — mark user as verified and clear OTP fields
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
