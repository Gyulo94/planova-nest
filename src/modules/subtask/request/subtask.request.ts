import { Prisma } from '@prisma/client';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SubtaskRequest {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  completed: boolean;

  static toModel(request: SubtaskRequest): Prisma.SubtaskUpdateInput {
    return {
      title: request.title,
      completed: request.completed,
    };
  }
}
