import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ActivityService } from '../service/activity.service';
import { ActivityRequest } from '../request/activity.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types/payload';
import { ActivityResponse } from '../response/activity.response';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('create')
  async createActivity(
    @Body() request: ActivityRequest,
    @CurrentUser() user: Payload,
  ): Promise<ActivityResponse> {
    if (!request.userId) {
      request.userId = user.id;
    }
    return this.activityService.createActivity(request);
  }

  @Get('workspace/:workspaceId')
  async findByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    return this.activityService.findActivities({
      workspaceId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    return this.activityService.findActivities({
      projectId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('task/:taskId')
  async findByTask(
    @Param('taskId') taskId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    return this.activityService.findActivities({
      taskId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
