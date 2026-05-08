/*
  Warnings:

  - You are about to drop the column `color` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Milestone` table. All the data in the column will be lost.
  - Made the column `projectId` on table `Milestone` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "color",
DROP COLUMN "icon",
ALTER COLUMN "projectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
