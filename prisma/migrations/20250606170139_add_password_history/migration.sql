/*
  Warnings:

  - You are about to drop the column `passwordHistory` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PasswordHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "User" DROP COLUMN "passwordHistory";
