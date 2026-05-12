import { Priority, Task, TaskStatus } from '@prisma/client';
import { EpicResponse } from 'src/epic/response/epic.response';
import { TaskPayload, TaskDetailPayload } from 'src/global/types';
import { LabelResponse } from 'src/label/label.response';
import { ProjectResponse } from 'src/project/response/project.response';
import { UserResponse } from 'src/user/response/user.response';

export class TaskResponse {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  progress: number;
  status: TaskStatus;
  priority: Priority;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  order: number;

  project?: ProjectResponse;
  epic?: EpicResponse;
  assignee?: UserResponse | null;
  label?: LabelResponse | null;

  static fromModel(model: Task): TaskResponse;
  static fromModel(model: TaskPayload): TaskResponse;
  static fromModel(model: TaskDetailPayload): TaskResponse;

  static fromModel(model: any): TaskResponse {
    const response = new TaskResponse();
    response.id = model.id;
    response.taskNumber = model.taskNumber;
    response.title = model.title;
    response.description = model.description;
    response.progress = model.progress;
    response.status = model.status;
    response.priority = model.priority;
    response.startDate = model.startDate;
    response.dueDate = model.dueDate;
    response.completedAt = model.completedAt;
    response.order = model.order;

    if ('project' in model && model.project) {
      response.project = ProjectResponse.fromModel(model.project);
    }

    if ('epic' in model && model.epic) {
      response.epic = EpicResponse.fromModel(model.epic);
    }


    if ('assignee' in model && model.assignee) {
      response.assignee = UserResponse.fromModel(model.assignee);
    }

    if ('label' in model && model.label) {
      response.label = LabelResponse.fromModel(model.label);
    }

    return response;
  }
}
