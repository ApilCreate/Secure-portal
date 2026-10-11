-- CreateTable
CREATE TABLE "EmailVerification" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "otp" TEXT NOT NULL,
    "otpExpiry" TIMESTAMP(3) NOT NULL
);
