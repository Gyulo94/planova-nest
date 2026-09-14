import { TaskResponse } from 'src/modules/task/response/task.response';
import type { TroubleshootingPayload } from '../repository/troubleshooting.repository';

export class TroubleshootingResponse {
  id: string;
  title: string;
  problem: string;
  solution: string;
  projectId: string;
  taskId: string | null;
  taskNumberSnapshot: number;
  taskTitleSnapshot: string;
  createdAt: Date;
  updatedAt: Date;
  task: TaskResponse | null;

  static fromModel(model: TroubleshootingPayload): TroubleshootingResponse {
    const response = new TroubleshootingResponse();
    response.id = model.id;
    response.title = model.title;
    response.problem = model.problem;
    response.solution = model.solution;
    response.projectId = model.projectId;
    response.taskId = model.taskId ?? null;
    response.taskNumberSnapshot = model.taskNumberSnapshot;
    response.taskTitleSnapshot = model.taskTitleSnapshot;
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;
    response.task = model.task ? TaskResponse.fromModel(model.task) : null;
    return response;
  }
}
