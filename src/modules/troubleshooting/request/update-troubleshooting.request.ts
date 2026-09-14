import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateTroubleshootingRequest {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;
}
