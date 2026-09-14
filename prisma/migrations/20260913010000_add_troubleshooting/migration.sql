-- CreateTable
CREATE TABLE "Troubleshooting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "taskId" UUID,
    "taskNumberSnapshot" INTEGER NOT NULL,
    "taskTitleSnapshot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Troubleshooting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Troubleshooting_projectId_updatedAt_idx" ON "Troubleshooting"("projectId", "updatedAt");

-- CreateIndex
CREATE INDEX "Troubleshooting_taskId_idx" ON "Troubleshooting"("taskId");

-- AddForeignKey
ALTER TABLE "Troubleshooting" ADD CONSTRAINT "Troubleshooting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Troubleshooting" ADD CONSTRAINT "Troubleshooting_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
