import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Message } from 'src/global/decorators/message.decorator';
import { ProjectRequest } from '../request/project.request';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { ProjectResponse } from '../response/project.response';
import type { Payload } from 'src/global/types';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Message(ResponseMessage.CREATE_PROJECT_SUCCESS)
  @Post('create')
  async createProject(
    @Body() request: ProjectRequest,
    @CurrentUser() user: Payload,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse = await this.projectService.createProject(
      request,
      user.id,
    );
    return response;
  }

  @Get('all/:workspaceId')
  async findProjects(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProjectResponse[]> {
    const response: ProjectResponse[] =
      await this.projectService.findAllByWorkspaceId(workspaceId);
    return response;
  }
}
