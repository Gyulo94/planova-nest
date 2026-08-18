import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class EpicRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;

  static toModel(request: EpicRequest) {
    return {
      title: request.title,
      description: request.description,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
      milestone: request.milestoneId
        ? { connect: { id: request.milestoneId } }
        : undefined,
    };
  }
}
