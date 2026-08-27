import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
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

  @IsOptional()
  @IsNumber()
  milestoneNumber: number;

  @IsOptional()
  @IsString()
  icon?: string | null;

  static toModel(request: MilestoneRequest): Prisma.MilestoneCreateInput {
    const {
      title,
      description,
      dueDate,
      completed,
      workspaceId,
      projectId,
      icon,
      milestoneNumber,
    } = request;
    return {
      title,
      description,
      dueDate: new Date(dueDate),
      completed: completed ?? false,
      workspace: { connect: { id: workspaceId } },
      project: { connect: { id: projectId } },
      milestoneNumber,
      icon,
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
