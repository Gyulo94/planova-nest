import { TaskStatus, Priority, Prisma } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class TaskRequest {
  @IsString()
  title: string;

  @IsOptional()
  @IsUUID()
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

  @IsUUID()
  assigneeId: string;

  @IsUUID()
  projectId: string;

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
    };
  }
}
