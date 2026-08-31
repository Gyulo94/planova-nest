import { IdeaStatus, Priority } from '@prisma/client';
import { ProjectResponse } from 'src/modules/project/response/project.response';
import { UserResponse } from 'src/modules/user/response/user.response';
import { WorkspaceResponse } from 'src/modules/workspace/response/workspace.response';
import { TaskResponse } from 'src/modules/task/response/task.response';
import { LabelResponse } from 'src/modules/label/response/label.response';

export class IdeaResponse {
  id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  priority: Priority;
  color: string;
  order: number;
  workspaceId: string;
  projectId: string | null;
  createdById: string;
  promotedToTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;

  user?: UserResponse | null;
  project?: ProjectResponse | null;
  workspace?: WorkspaceResponse | null;
  task?: TaskResponse | null;
  label?: LabelResponse | null;

  static fromModel(model: any): IdeaResponse {
    const response = new IdeaResponse();
    response.id = model.id;
    response.title = model.title;
    response.description = model.description ?? null;
    response.status = model.status;
    response.priority = model.priority;
    response.color = model.color;
    response.order = model.order;
    response.workspaceId = model.workspaceId;
    response.projectId = model.projectId ?? null;
    response.createdById = model.createdById;
    response.promotedToTaskId = model.promotedToTaskId ?? null;
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;

    if ('user' in model && model.user) {
      response.user = UserResponse.fromModel(model.user);
    }
    if ('project' in model && model.project) {
      response.project = ProjectResponse.fromModel(model.project);
    }
    if ('workspace' in model && model.workspace) {
      response.workspace = WorkspaceResponse.fromModel(model.workspace);
    }
    if ('task' in model && model.task) {
      response.task = TaskResponse.fromModel(model.task);
    }
    if ('label' in model && model.label) {
      response.label = LabelResponse.fromModel(model.label);
    }
    return response;
  }
}
