CREATE TABLE "ProjectDocumentation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDocumentation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectDocumentationVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentationId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceSummary" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDocumentationVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectDocumentation_projectId_key" ON "ProjectDocumentation"("projectId");
CREATE INDEX "ProjectDocumentation_projectId_idx" ON "ProjectDocumentation"("projectId");
CREATE INDEX "ProjectDocumentationVersion_createdById_idx" ON "ProjectDocumentationVersion"("createdById");
CREATE INDEX "ProjectDocumentationVersion_documentationId_version_idx" ON "ProjectDocumentationVersion"("documentationId", "version");
CREATE UNIQUE INDEX "ProjectDocumentationVersion_documentationId_version_key" ON "ProjectDocumentationVersion"("documentationId", "version");

ALTER TABLE "ProjectDocumentation" ADD CONSTRAINT "ProjectDocumentation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocumentationVersion" ADD CONSTRAINT "ProjectDocumentationVersion_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "ProjectDocumentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocumentationVersion" ADD CONSTRAINT "ProjectDocumentationVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
