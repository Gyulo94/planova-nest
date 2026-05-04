import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectMemberService } from '../service/project-member.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { WorkspaceMemberResponse } from 'src/workspace-member/response/workspace-member.response';
import { InviteProjectMemberRequest } from '../request/project-member.request';

@Controller('project-member')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Get('all/:projectId')
  async findProjectMembers(
    @Param('projectId') projectId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.projectMemberService.findProjectMembers(
      projectId,
      user.id,
    );
    return response;
  }

  @Get(':projectId/workspace-members/available')
  async findAvailableWorkspaceMembers(
    @Param('projectId') projectId: string,
    @CurrentUser() user: Payload,
  ): Promise<WorkspaceMemberResponse[]> {
    const response =
      await this.projectMemberService.findAvailableWorkspaceMembers(
        projectId,
        user.id,
      );
    return response;
  }

  @Message(ResponseMessage.UPDATE_PROJECT_MEMBER_SUCCESS)
  @Put(':projectId/member/:memberId/update')
  async updateProjectMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.projectMemberService.updateProjectMember(
      projectId,
      memberId,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_PROJECT_MEMBER_SUCCESS)
  @Delete(':projectId/member/:memberId/remove')
  async removeProjectMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.projectMemberService.removeProjectMember(
      projectId,
      memberId,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.INVITE_PROJECT_MEMBER_SUCCESS)
  @Post(':projectId/invite')
  async inviteProjectMembers(
    @Param('projectId') projectId: string,
    @Body() request: InviteProjectMemberRequest,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.projectMemberService.inviteProjectMembers(
      projectId,
      request.userIds,
      user.id,
    );
    return response;
  }
}
