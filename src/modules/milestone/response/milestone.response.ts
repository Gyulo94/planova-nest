import { Milestone } from '@prisma/client';
import { ProjectResponse } from 'src/modules/project/response/project.response';
import { EpicResponse } from 'src/modules/epic/response/epic.response';
import { WorkspaceResponse } from 'src/modules/workspace/response/workspace.response';

export class MilestoneResponse {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  workspaceId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  icon?: string | null;
  milestoneNumber: number;
  project?: ProjectResponse;
  workspace?: WorkspaceResponse;
  epics?: EpicResponse[];

  static fromModel(model: Milestone): MilestoneResponse;
  static fromModel(model: any): MilestoneResponse {
    const response = new MilestoneResponse();
    response.id = model.id;
    response.title = model.title;
    response.milestoneNumber = model.milestoneNumber;
    response.icon = model.icon ?? null;
    response.description = model.description ?? undefined;
    response.dueDate = model.dueDate;
    response.completed = model.completed;
    response.workspaceId = model.workspaceId;
    response.projectId = model.projectId;
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;

    if ('project' in model && model.project) {
      response.project = ProjectResponse.fromModel(model.project);
    }
    if ('workspace' in model && model.workspace) {
      response.workspace = WorkspaceResponse.fromModel(model.workspace);
    }
    if ('epics' in model && model.epics) {
      response.epics = model.epics.map((epic) => EpicResponse.fromModel(epic));
    }
    return response;
  }
}
