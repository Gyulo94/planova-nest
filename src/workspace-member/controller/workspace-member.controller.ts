import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { WorkspaceMemberService } from '../service/workspace-member.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types';
import { WorkspaceMemberRequest } from '../reuqest/workspace-member.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';

@Controller('workspace-member')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Get('all/:workspaceId')
  async findWorkspaceMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.workspaceMemberService.findWorkspaceMembers(
      workspaceId,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.JOIN_WORKSPACE_SUCCESS)
  @Post(`join`)
  async joinWorkspace(
    @Body() request: WorkspaceMemberRequest,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.workspaceMemberService.joinWorkspace(
      request,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.UPDATE_WORKSPACE_MEMBER_SUCCESS)
  @Put(':workspaceId/member/:memberId/update')
  async updateWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.workspaceMemberService.updateWorkspaceMember(
      workspaceId,
      memberId,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_WORKSPACE_MEMBER_SUCCESS)
  @Delete(':workspaceId/member/:memberId/remove')
  async removeWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.workspaceMemberService.removeWorkspaceMember(
      workspaceId,
      memberId,
      user.id,
    );
    return response;
  }
}
