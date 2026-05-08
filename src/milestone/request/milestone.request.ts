import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class MilestoneRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  static toModel(request: MilestoneRequest): Prisma.MilestoneCreateInput {
    const { title, description, dueDate, completed, workspaceId, projectId } =
      request;
    return {
      title,
      description,
      dueDate: new Date(dueDate),
      completed: completed ?? false,
      workspace: { connect: { id: workspaceId } },
      project: { connect: { id: projectId } },
    };
  }
}

export class UpdateMilestoneRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;
}
