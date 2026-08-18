import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Message } from 'src/global/decorators/message.decorator';
import { ProjectRequest } from '../request/project.request';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { ProjectResponse } from '../response/project.response';
import { ProjectMemberService } from 'src/modules/project-member/service/project-member.service';
import {
  CurrentWorkspaceMember,
  ProjectMemberGuard,
  Role,
  WorkspaceMemberGuard,
} from 'src/global';
import type { WorkspaceMember } from '@prisma/client';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectMemberService: ProjectMemberService,
  ) {}

  @Message(ResponseMessage.CREATE_PROJECT_SUCCESS)
  @Post('create')
  @Role('OWNER')
  @UseGuards(WorkspaceMemberGuard)
  async createProject(
    @Body() request: ProjectRequest,
    @CurrentWorkspaceMember() workspaceMember: WorkspaceMember,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse = await this.projectService.createProject(
      request,
      workspaceMember.userId,
    );
    return response;
  }

  @Get('all/:workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  async findProjects(
    @Param('workspaceId') workspaceId: string,
    @CurrentWorkspaceMember() workspaceMember: WorkspaceMember,
  ): Promise<ProjectResponse[]> {
    const response: ProjectResponse[] = await this.projectService.findProjects(
      workspaceId,
      workspaceMember.userId,
    );
    return response;
  }

  @Get(':projectId/labels')
  @UseGuards(ProjectMemberGuard)
  async findLabelsByProjectId(@Param('projectId') projectId: string) {
    return this.projectService.findLabelsByProjectId(projectId);
  }

  @Get(':projectId')
  @UseGuards(ProjectMemberGuard)
  async findProjectById(
    @Param('projectId') projectId: string,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse =
      await this.projectService.findProjectById(projectId);
    return response;
  }

  @Message(ResponseMessage.UPDATE_PROJECT_SUCCESS)
  @Put(':projectId/update')
  @Role('OWNER', 'ADMIN')
  @UseGuards(ProjectMemberGuard)
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() request: ProjectRequest,
    @CurrentWorkspaceMember() workspaceMember: WorkspaceMember,
  ): Promise<ProjectResponse> {
    const response: ProjectResponse = await this.projectService.updateProject(
      projectId,
      request,
      workspaceMember.userId,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_PROJECT_SUCCESS)
  @Delete(':projectId/delete')
  @Role('OWNER')
  @UseGuards(ProjectMemberGuard)
  async deleteProject(
    @Param('projectId') projectId: string,
    @CurrentWorkspaceMember() workspaceMember: WorkspaceMember,
  ): Promise<void> {
    await this.projectService.deleteProject(projectId, workspaceMember.userId);
  }

  @Get(':projectId/task-counts')
  @UseGuards(ProjectMemberGuard)
  async getTaskStatusCounts(@Param('projectId') projectId: string) {
    const response = await this.projectService.getTaskStatusCounts(projectId);
    return response;
  }
}
