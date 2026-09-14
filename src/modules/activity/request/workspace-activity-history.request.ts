import { IsOptional, IsUUID } from 'class-validator';
import { ProjectActivityHistoryRequest } from './project-activity-history.request';

export class WorkspaceActivityHistoryRequest extends ProjectActivityHistoryRequest {
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
