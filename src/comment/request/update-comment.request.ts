import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentRequest {
  @IsNotEmpty()
  @IsString()
  content: string;
}
