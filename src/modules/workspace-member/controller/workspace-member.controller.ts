import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
} from '@nestjs/common';
import { WorkspaceMemberService } from '../service/workspace-member.service';
import { WorkspaceMemberRequest } from '../reuqest/workspace-member.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('workspace-member')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Get('all/:workspaceId')
  async findWorkspaceMembers(
    @Param('workspaceId') workspaceId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.workspaceMemberService.findWorkspaceMembers(
      workspaceId,
      session.user.id,
    );
    return response;
  }

  @Message(ResponseMessage.JOIN_WORKSPACE_SUCCESS)
  @Post(`join`)
  async joinWorkspace(
    @Body() request: WorkspaceMemberRequest,
    @Session() session: UserSession,
  ) {
    const response = await this.workspaceMemberService.joinWorkspace(
      request,
      session.user.id,
    );
    return response;
  }

  @Message(ResponseMessage.UPDATE_WORKSPACE_MEMBER_SUCCESS)
  @Put(':workspaceId/member/:memberId/update')
  async updateWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.workspaceMemberService.updateWorkspaceMember(
      workspaceId,
      memberId,
      session.user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_WORKSPACE_MEMBER_SUCCESS)
  @Delete(':workspaceId/member/:memberId/remove')
  async removeWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.workspaceMemberService.removeWorkspaceMember(
      workspaceId,
      memberId,
      session.user.id,
    );
    return response;
  }
}
