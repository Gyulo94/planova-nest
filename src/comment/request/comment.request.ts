import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CommentRequest {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  taskId: string;

  static toModel(request: CommentRequest) {
    return {
      content: request.content,
      taskId: request.taskId,
    };
  }
}
