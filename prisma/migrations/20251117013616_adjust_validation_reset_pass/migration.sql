/*
  Warnings:

  - The primary key for the `reset_pass` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `attempt` on the `reset_pass` table. All the data in the column will be lost.
  - You are about to drop the column `cooldown_until` on the `reset_pass` table. All the data in the column will be lost.
  - You are about to drop the column `id_link` on the `reset_pass` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `reset_pass` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `reset_pass` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `reset_pass` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "reset_pass_email_key";

-- AlterTable
ALTER TABLE "reset_pass" DROP CONSTRAINT "reset_pass_pkey",
DROP COLUMN "attempt",
DROP COLUMN "cooldown_until",
DROP COLUMN "id_link",
DROP COLUMN "is_verified",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "reset_pass_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "reset_pass_token_key" ON "reset_pass"("token");
