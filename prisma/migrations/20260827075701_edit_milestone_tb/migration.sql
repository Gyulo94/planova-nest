/*
  Warnings:

  - Added the required column `milestoneNumber` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Epic" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "milestoneNumber" INTEGER NOT NULL;
