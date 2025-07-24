/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discipline` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `educationalInstitution` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "discipline" TEXT NOT NULL,
ADD COLUMN     "educationalInstitution" TEXT NOT NULL,
ADD COLUMN     "experience" VARCHAR(100) NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");
