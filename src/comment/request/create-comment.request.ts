import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentRequest {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}
