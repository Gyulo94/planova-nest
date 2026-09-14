import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from '../service/activity.service';
import { ActivityRequest } from '../request/activity.request';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ActivityResponse } from '../response/activity.response';
import { ProjectMemberGuard, WorkspaceMemberGuard } from 'src/global';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('create')
  async createActivity(
    @Body() request: ActivityRequest,
    @Session() session: UserSession,
  ): Promise<ActivityResponse> {
    if (!request.userId) {
      request.userId = session.user.id;
    }
    const response = await this.activityService.createActivity(request);
    return response;
  }

  @Get('workspace/:workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  async findByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    const response = await this.activityService.findActivities({
      workspaceId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return response;
  }

  @Get('project/:projectId')
  @UseGuards(ProjectMemberGuard)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    const response = await this.activityService.findActivities({
      projectId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return response;
  }

  @Get('task/:taskId')
  async findByTask(
    @Param('taskId') taskId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ActivityResponse[]> {
    const response = await this.activityService.findActivities({
      taskId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return response;
  }
}
