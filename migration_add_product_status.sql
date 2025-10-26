-- Migration: Add status field to Product table
-- Date: 2025-10-26
-- Description: Add ProductStatus enum and status column to Product table with default value 'INACTIVE'

-- Create enum type
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'WAITING_ACTIVE');

-- Add status column to Product table with default value
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'INACTIVE';

-- Create index on status for better query performance
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- Update existing products based on publishedAt
-- If publishedAt is not null and in the past, set status to ACTIVE
UPDATE "Product"
SET "status" = 'ACTIVE'
WHERE "publishedAt" IS NOT NULL
  AND "publishedAt" <= NOW()
  AND "deletedAt" IS NULL;

-- If publishedAt is in the future, set status to WAITING_ACTIVE
UPDATE "Product"
SET "status" = 'WAITING_ACTIVE'
WHERE "publishedAt" IS NOT NULL
  AND "publishedAt" > NOW()
  AND "deletedAt" IS NULL;