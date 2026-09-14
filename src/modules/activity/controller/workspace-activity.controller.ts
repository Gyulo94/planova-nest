import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WorkspaceMemberGuard } from 'src/global';
import { WorkspaceActivityHistoryRequest } from '../request/workspace-activity-history.request';
import { WorkspaceActivityHistoryResponse } from '../response/workspace-activity-history.response';
import { ActivityService } from '../service/activity.service';

@Controller('workspace/:workspaceId/activities')
@UseGuards(WorkspaceMemberGuard)
export class WorkspaceActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findWorkspaceActivityHistory(
    @Param('workspaceId') workspaceId: string,
    @Query() query: WorkspaceActivityHistoryRequest,
  ): Promise<WorkspaceActivityHistoryResponse> {
    const response = await this.activityService.findWorkspaceActivityHistory(
      workspaceId,
      query,
    );
    return response;
  }
}
