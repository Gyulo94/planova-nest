import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class ActivityRequest {
  @IsString()
  action: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  metadata?: object;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsString()
  userId: string;

  static toModel(request: ActivityRequest): Prisma.ActivityCreateInput {
    return {
      action: request.action,
      description: request.description,
      metadata: request.metadata,
      workspaceId: request.workspaceId,
      projectId: request.projectId,
      taskId: request.taskId,
      user: {
        connect: {
          id: request.userId,
        },
      },
    };
  }
}
