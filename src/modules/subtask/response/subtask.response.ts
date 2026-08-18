import { Subtask } from '@prisma/client';

export class SubtaskResponse {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  taskId: string;

  static fromModel(model: Subtask): SubtaskResponse;
  static fromModel(model: any): SubtaskResponse {
    const response = new SubtaskResponse();
    response.id = model.id;
    response.title = model.title;
    response.completed = model.completed;
    response.order = model.order;
    response.taskId = model.taskId;
    return response;
  }
}
