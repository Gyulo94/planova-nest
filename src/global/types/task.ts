import { Prisma, Task } from '@prisma/client';

export type TaskPayload = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: true;
    label: true;
    epic: true;
  };
}>;

export type TaskDetailPayload = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: true;
    label: true;
    epic: true;
    subtask: true;
    approval: { include: { user: true } };
  };
}>;

export type TaskWithProject = Prisma.TaskGetPayload<{
  include: { project: true };
}>;

export type ApprovalPayload = Prisma.ApprovalGetPayload<{
  include: { user: true };
}>;

export type TaskEventPayload = {
  workspaceId: string;
  projectId: string;
  task?: TaskDetailPayload | Task;
  taskId?: string;
};
