import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum ActivityCategory {
  TASK = 'TASK',
  IDEA = 'IDEA',
  EPIC = 'EPIC',
  MILESTONE = 'MILESTONE',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  PROJECT = 'PROJECT',
  WORKSPACE = 'WORKSPACE',
  DOCUMENTATION = 'DOCUMENTATION',
}

export class ProjectActivityHistoryRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 30;

  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
