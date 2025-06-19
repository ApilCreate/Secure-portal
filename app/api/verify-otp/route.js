import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP are required." }), { status: 400 });
    }

    const record = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!record || !record.otp || !record.otpExpiry) {
      return new Response(JSON.stringify({ error: "No OTP found for this email." }), { status: 400 });
    }

    const now = new Date();
    if (record.otp !== otp) {
      return new Response(JSON.stringify({ error: "Invalid OTP." }), { status: 400 });
    }

    if (record.otpExpiry < now) {
      return new Response(JSON.stringify({ error: "OTP has expired." }), { status: 400 });
    }

    await prisma.emailVerification.delete({
      where: { email },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 });
  }
}
