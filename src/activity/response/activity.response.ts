import { ActivityPayload } from 'src/global/types';
import { UserResponse } from 'src/user/response/user.response';

export class ActivityResponse {
  id: string;
  action: string;
  description: string;
  metadata?: any;
  workspaceId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  userId: string;
  createdAt: Date;
  user?: UserResponse | null;

  static fromModel(model: ActivityPayload): ActivityResponse {
    const response = new ActivityResponse();
    response.id = model.id;
    response.action = model.action;
    response.description = model.description;
    response.metadata = model.metadata;
    response.workspaceId = model.workspaceId;
    response.projectId = model.projectId;
    response.taskId = model.taskId;
    response.userId = model.userId;
    response.createdAt = model.createdAt;

    if (model.user) {
      response.user = UserResponse.fromModel(model.user);
    }

    return response;
  }
}
