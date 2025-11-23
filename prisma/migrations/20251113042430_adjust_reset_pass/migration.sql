/*
  Warnings:

  - You are about to drop the `otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_reset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "otp";

-- DropTable
DROP TABLE "password_reset";

-- CreateTable
CREATE TABLE "reset_pass" (
    "id_otp" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_until" TIMESTAMP(3),

    CONSTRAINT "reset_pass_pkey" PRIMARY KEY ("id_otp")
);
