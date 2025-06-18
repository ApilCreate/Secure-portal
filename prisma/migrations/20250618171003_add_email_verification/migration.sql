-- CreateTable
CREATE TABLE "EmailVerification" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "otp" TEXT NOT NULL,
    "otpExpiry" DATETIME NOT NULL
);
