import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Message } from 'src/global/decorators/message.decorator';
import { ProjectRequest } from '../request/project.request';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { ProjectResponse } from '../response/project.response';
import type { Payload } from 'src/global/types';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { ProjectMemberService } from 'src/project-member/service/project-member.service';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectMemberService: ProjectMemberService,
  ) {}

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
    @CurrentUser() user: Payload,
  ): Promise<ProjectResponse[]> {
    const response: ProjectResponse[] =
      await this.projectMemberService.findProjects(workspaceId, user.id);
    return response;
  }

  @Get(':projectId/labels')
  async findLabelsByProjectId(@Param('projectId') projectId: string) {
    return this.projectService.findLabelsByProjectId(projectId);
  }

  @Get(':projectId')
  async findProjectById(
    @Param('projectId') projectId: string,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse =
      await this.projectService.findProjectById(projectId);
    return response;
  }

  @Message(ResponseMessage.UPDATE_PROJECT_SUCCESS)
  @Put(':projectId/update')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() request: ProjectRequest,
    @CurrentUser() user: Payload,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse = await this.projectService.updateProject(
      projectId,
      request,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_PROJECT_SUCCESS)
  @Delete(':projectId/delete')
  async deleteProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: Payload,
  ): Promise<void> {
    await this.projectService.deleteProject(projectId, user.id);
  }
}
