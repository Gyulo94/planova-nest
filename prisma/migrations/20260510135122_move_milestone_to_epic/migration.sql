/*
  Warnings:

  - You are about to drop the column `comment` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_milestoneId_fkey";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "comment";

-- AlterTable
ALTER TABLE "Epic" ADD COLUMN     "milestoneId" UUID;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "milestoneId";

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
