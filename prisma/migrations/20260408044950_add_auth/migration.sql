-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "public"."IndicatorResult" ADD COLUMN     "submittedById" TEXT;

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "IndicatorResult_submittedById_idx" ON "public"."IndicatorResult"("submittedById");

-- AddForeignKey
ALTER TABLE "public"."IndicatorResult" ADD CONSTRAINT "IndicatorResult_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
