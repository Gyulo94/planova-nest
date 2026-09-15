-- Workspace deletion must remove every workspace-scoped entity. Projects already
-- cascade, but these direct workspace foreign keys previously used RESTRICT and
-- prevented a workspace containing planning data from being deleted.
ALTER TABLE "Epic" DROP CONSTRAINT "Epic_workspaceId_fkey";
ALTER TABLE "Idea" DROP CONSTRAINT "Idea_workspaceId_fkey";
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_workspaceId_fkey";

ALTER TABLE "Epic"
ADD CONSTRAINT "Epic_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Idea"
ADD CONSTRAINT "Idea_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Milestone"
ADD CONSTRAINT "Milestone_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
