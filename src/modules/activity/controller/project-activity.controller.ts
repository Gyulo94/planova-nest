import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectMemberGuard } from 'src/global';
import { ProjectActivityHistoryRequest } from '../request/project-activity-history.request';
import { ProjectActivityHistoryResponse } from '../response/project-activity-history.response';
import { ActivityService } from '../service/activity.service';

@Controller('project/:projectId/activities')
@UseGuards(ProjectMemberGuard)
export class ProjectActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findProjectActivityHistory(
    @Param('projectId') projectId: string,
    @Query() query: ProjectActivityHistoryRequest,
  ): Promise<ProjectActivityHistoryResponse> {
    const response = await this.activityService.findProjectActivityHistory(
      projectId,
      query,
    );
    return response;
  }
}
