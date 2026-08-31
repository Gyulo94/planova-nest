import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { IdeaStatus, Priority } from '@prisma/client';

export class IdeaRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IdeaStatus)
  status?: IdeaStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  labelId?: string;

  @IsOptional()
  @IsString()
  promotedToTaskId?: string;

  static toModel(request: IdeaRequest, createdById: string) {
    return {
      title: request.title,
      description: request.description,
      status: request.status ?? IdeaStatus.RAW,
      priority: request.priority ?? Priority.MEDIUM,
      color: request.color ?? 'yellow',
      order: request.order,
      workspace: { connect: { id: request.workspaceId } },
      project: request.projectId
        ? { connect: { id: request.projectId } }
        : undefined,
      user: { connect: { id: createdById } },
      label: request.labelId ? { connect: { id: request.labelId } } : undefined,
      task: request.promotedToTaskId
        ? { connect: { id: request.promotedToTaskId } }
        : undefined,
    };
  }
}
