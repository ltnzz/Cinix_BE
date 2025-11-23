/*
  Warnings:

  - The primary key for the `reset_pass` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_otp` on the `reset_pass` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `reset_pass` table. All the data in the column will be lost.
  - Added the required column `link` to the `reset_pass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reset_pass" DROP CONSTRAINT "reset_pass_pkey",
DROP COLUMN "id_otp",
DROP COLUMN "otp",
ADD COLUMN     "id_link" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "link" TEXT NOT NULL,
ADD CONSTRAINT "reset_pass_pkey" PRIMARY KEY ("id_link");
