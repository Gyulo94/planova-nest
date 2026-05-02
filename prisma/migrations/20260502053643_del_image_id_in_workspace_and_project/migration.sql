/*
  Warnings:

  - You are about to drop the column `imageId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Workspace` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_imageId_fkey";

-- DropIndex
DROP INDEX "Project_imageId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "imageId";

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "imageId";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
