-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
ADD COLUMN     "discountAmount" INTEGER DEFAULT 0,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" VARCHAR(500),
ADD COLUMN     "citizenId" VARCHAR(20);
