import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReorderTaskItem {
  @IsString()
  id: string;

  @IsNumber()
  order: number;

  @IsEnum(TaskStatus)
  @Type(() => String)
  status: TaskStatus;
}

export class ReorderTaskRequest {
  @IsString()
  projectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskItem)
  updates: ReorderTaskItem[];
}
