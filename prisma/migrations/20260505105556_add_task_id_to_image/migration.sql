-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "taskId" UUID;

-- CreateIndex
CREATE INDEX "Image_taskId_idx" ON "Image"("taskId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
