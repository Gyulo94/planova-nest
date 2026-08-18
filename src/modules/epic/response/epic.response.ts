import { Epic } from '@prisma/client';
import { EpicPayload } from 'src/global/types';
import { ProjectResponse } from 'src/modules/project/response/project.response';
import { TaskResponse } from 'src/modules/task/response/task.response';
import { UserResponse } from 'src/modules/user/response/user.response';
import { WorkspaceResponse } from 'src/modules/workspace/response/workspace.response';
import { MilestoneResponse } from 'src/modules/milestone/response/milestone.response';

export class EpicResponse {
  id: string;
  epicNumber: number;
  title: string;
  description: string | null;
  progress: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  workspaceId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserResponse | null;
  project: ProjectResponse | null;
  workspace: WorkspaceResponse | null;
  tasks: TaskResponse[] | null;
  milestone: MilestoneResponse | null;
  taskCount: number;
  completedTasks: number;

  static fromModel(model: Epic): EpicResponse;
  static fromModel(model: EpicPayload): EpicResponse;
  static fromModel(model: Epic | EpicPayload): EpicResponse {
    const response = new EpicResponse();
    response.id = model.id;
    response.epicNumber = model.epicNumber;
    response.title = model.title;
    response.description = model.description ?? null;
    response.progress = model.progress;
    response.startDate = model.startDate ?? undefined;
    response.dueDate = model.dueDate ?? undefined;
    response.completedAt = model.completedAt ?? undefined;
    response.workspaceId = model.workspaceId;
    response.projectId = model.projectId ?? undefined;
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;
    if ('user' in model && model.user) {
      response.user = UserResponse.fromModel(model.user as any);
    }
    if ('project' in model && model.project) {
      response.project = ProjectResponse.fromModel(model.project as any);
    }
    if ('workspace' in model && model.workspace) {
      response.workspace = WorkspaceResponse.fromModel(model.workspace as any);
    }
    if ('tasks' in model && model.tasks) {
      response.tasks = model.tasks.map((t) => TaskResponse.fromModel(t));
    }
    if ('milestone' in model && model.milestone) {
      response.milestone = MilestoneResponse.fromModel(model.milestone as any);
    }

    if ('_count' in model && (model as any)._count) {
      response.taskCount = (model as any)._count.tasks;
    } else if ('tasks' in model && model.tasks) {
      response.taskCount = (model.tasks as any).length;
    } else {
      response.taskCount = 0;
    }

    if ('tasks' in model && model.tasks) {
      response.completedTasks = (model.tasks as any).filter(
        (t: any) => t.status === 'DONE',
      ).length;
    } else {
      response.completedTasks = 0;
    }
    return response;
  }
}
