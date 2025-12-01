/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `theaters` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "theaters" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "theaters_name_key" ON "theaters"("name");
