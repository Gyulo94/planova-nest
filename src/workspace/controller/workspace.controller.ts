import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkspaceService } from '../service/workspace.service';
import { WorkspaceRequest } from '../request/workspace.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types/payload';
import { WorkspaceResponse } from '../response/workspace.response';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { WorkspaceMemberService } from 'src/workspace-member/service/workspace-member.service';

@Controller('workspace')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Message(ResponseMessage.CREATE_WORKSPACE_SUCCESS)
  @Post('create')
  async createWorkspace(
    @Body() request: WorkspaceRequest,
    @CurrentUser() user: Payload,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.createWorkspace(request, user.id);
    return response;
  }

  @Get('all')
  async findWorkspaces(
    @CurrentUser() user: Payload,
  ): Promise<WorkspaceResponse[]> {
    const response: WorkspaceResponse[] =
      await this.workspaceMemberService.findWorkspaces(user.id);
    return response;
  }

  @Get(':workspaceId')
  async findWorkspaceById(
    @CurrentUser() user: Payload,
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.findWorkspaceById(workspaceId, user.id);
    return response;
  }
}
