/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `citizenId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SellerRegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "address",
DROP COLUMN "bankAccountName",
DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankName",
DROP COLUMN "citizenId";

-- CreateTable
CREATE TABLE "public"."SellerRegistration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "citizenId" VARCHAR(20) NOT NULL,
    "citizenIdFrontImage" VARCHAR(1000) NOT NULL,
    "citizenIdBackImage" VARCHAR(1000) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "bankAccountNumber" VARCHAR(100) NOT NULL,
    "bankName" VARCHAR(200) NOT NULL,
    "bankAccountName" VARCHAR(200) NOT NULL,
    "registrationFee" DOUBLE PRECISION NOT NULL DEFAULT 500000,
    "paymentId" INTEGER,
    "status" "public"."SellerRegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "rejectionReason" TEXT,
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerRegistration_userId_idx" ON "public"."SellerRegistration"("userId");

-- CreateIndex
CREATE INDEX "SellerRegistration_status_idx" ON "public"."SellerRegistration"("status");

-- AddForeignKey
ALTER TABLE "public"."SellerRegistration" ADD CONSTRAINT "SellerRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SellerRegistration" ADD CONSTRAINT "SellerRegistration_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SellerRegistration" ADD CONSTRAINT "SellerRegistration_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
