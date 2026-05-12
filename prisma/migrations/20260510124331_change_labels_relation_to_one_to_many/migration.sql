/*
  Warnings:

  - You are about to drop the `BacklogLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IdeaLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskAssignee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskLabel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BacklogLabel" DROP CONSTRAINT "BacklogLabel_backlogId_fkey";

-- DropForeignKey
ALTER TABLE "BacklogLabel" DROP CONSTRAINT "BacklogLabel_labelId_fkey";

-- DropForeignKey
ALTER TABLE "IdeaLabel" DROP CONSTRAINT "IdeaLabel_ideaId_fkey";

-- DropForeignKey
ALTER TABLE "IdeaLabel" DROP CONSTRAINT "IdeaLabel_labelId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignee" DROP CONSTRAINT "TaskAssignee_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignee" DROP CONSTRAINT "TaskAssignee_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaskLabel" DROP CONSTRAINT "TaskLabel_labelId_fkey";

-- DropForeignKey
ALTER TABLE "TaskLabel" DROP CONSTRAINT "TaskLabel_taskId_fkey";

-- AlterTable
ALTER TABLE "Backlog" ADD COLUMN     "labelId" UUID;

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "labelId" UUID;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assigneeId" UUID,
ADD COLUMN     "labelId" UUID;

-- DropTable
DROP TABLE "BacklogLabel";

-- DropTable
DROP TABLE "IdeaLabel";

-- DropTable
DROP TABLE "TaskAssignee";

-- DropTable
DROP TABLE "TaskLabel";

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
