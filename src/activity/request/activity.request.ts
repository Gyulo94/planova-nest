import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class ActivityRequest {
  @IsString()
  action: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsUUID()
  userId: string;
}
