import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.findWorkspaceById(workspaceId);
    return response;
  }

  @Message(ResponseMessage.UPDATE_WORKSPACE_SUCCESS)
  @Put(':workspaceId/update')
  async updateWorkspace(
    @CurrentUser() user: Payload,
    @Param('workspaceId') workspaceId: string,
    @Body() request: WorkspaceRequest,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.updateWorkspace(
        workspaceId,
        request,
        user.id,
      );
    return response;
  }

  @Message(ResponseMessage.DELETE_WORKSPACE_SUCCESS)
  @Delete(':workspaceId/delete')
  async deleteWorkspace(
    @CurrentUser() user: Payload,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    const response = await this.workspaceService.deleteWorkspace(
      workspaceId,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.RESET_INVITE_CODE_SUCCESS)
  @Put(':workspaceId/invite-code/reset')
  async resetInviteCode(
    @CurrentUser() user: Payload,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    await this.workspaceService.resetInviteCode(workspaceId, user.id);
  }
}
