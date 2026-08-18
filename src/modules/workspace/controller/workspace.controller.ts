import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from '../service/workspace.service';
import { WorkspaceRequest } from '../request/workspace.request';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { WorkspaceResponse } from '../response/workspace.response';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { WorkspaceMemberService } from 'src/modules/workspace-member/service/workspace-member.service';
import { Role, WorkspaceMemberGuard } from 'src/global';

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
    @Session() session: UserSession,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.createWorkspace(request, session.user.id);
    return response;
  }

  @Get('all')
  async findWorkspaces(
    @Session() session: UserSession,
  ): Promise<WorkspaceResponse[]> {
    const response: WorkspaceResponse[] =
      await this.workspaceService.findWorkspacesByUserId(session.user.id);
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

  @Role('OWNER')
  @UseGuards(WorkspaceMemberGuard)
  @Message(ResponseMessage.UPDATE_WORKSPACE_SUCCESS)
  @Put(':workspaceId/update')
  async updateWorkspace(
    @Session() session: UserSession,
    @Param('workspaceId') workspaceId: string,
    @Body() request: WorkspaceRequest,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.updateWorkspace(
        workspaceId,
        request,
        session.user.id,
      );
    return response;
  }

  @Role('OWNER')
  @UseGuards(WorkspaceMemberGuard)
  @Message(ResponseMessage.DELETE_WORKSPACE_SUCCESS)
  @Delete(':workspaceId/delete')
  async deleteWorkspace(
    @Session() session: UserSession,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    const response = await this.workspaceService.deleteWorkspace(
      workspaceId,
      session.user.id,
    );
    return response;
  }

  @Role('OWNER')
  @UseGuards(WorkspaceMemberGuard)
  @Message(ResponseMessage.RESET_INVITE_CODE_SUCCESS)
  @Put(':workspaceId/invite-code/reset')
  async resetInviteCode(
    @Session() session: UserSession,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    await this.workspaceService.resetInviteCode(workspaceId, session.user.id);
  }

  @Get(':workspaceId/stats')
  async getWorkspaceStats(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.findWorkspaceStats(workspaceId);
  }
}
