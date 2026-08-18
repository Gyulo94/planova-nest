import { CommentPayload } from 'src/global/types';
import { UserResponse } from 'src/modules/user/response/user.response';

export class CommentResponse {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  user?: UserResponse | null;

  static fromModel(model: CommentPayload): CommentResponse {
    const response = new CommentResponse();
    response.id = model.id;
    response.content = model.content;
    response.taskId = model.taskId;
    response.userId = model.userId;
    response.createdAt = model.createdAt;
    response.user = model.user ? UserResponse.fromModel(model.user) : null;

    return response;
  }
}
