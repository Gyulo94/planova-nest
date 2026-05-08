import { TaskStatus, Priority, Prisma } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString
} from 'class-validator';

export class TaskRequest {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  labelId?: string;

  @IsOptional()
  @IsString()
  labelName?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsEnum(Priority)
  priority: Priority;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  assigneeId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  epicId?: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;

  static toModel(
    request: TaskRequest,
    taskNumber: number,
  ): Prisma.TaskCreateInput {
    return {
      taskNumber,
      title: request.title,
      status: request.status,
      priority: request.priority,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
      project: { connect: { id: request.projectId } },
      epic: request.epicId ? { connect: { id: request.epicId } } : undefined,
      milestone: request.milestoneId ? { connect: { id: request.milestoneId } } : undefined,
    };
  }
}
