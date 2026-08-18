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
import { ProjectMemberService } from '../service/project-member.service';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { WorkspaceMemberResponse } from 'src/modules/workspace-member/response/workspace-member.response';
import { InviteProjectMemberRequest } from '../request/project-member.request';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ProjectMemberGuard, Role } from 'src/global';

@Controller('project-member')
@UseGuards(ProjectMemberGuard)
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Get('all/:projectId')
  async findProjectMembers(@Param('projectId') projectId: string) {
    const response =
      await this.projectMemberService.findProjectMembers(projectId);
    return response;
  }

  @Role('OWNER')
  @Get(':projectId/workspace-members/available')
  async findAvailableWorkspaceMembers(
    @Param('projectId') projectId: string,
    @Session() session: UserSession,
  ): Promise<WorkspaceMemberResponse[]> {
    const response =
      await this.projectMemberService.findAvailableWorkspaceMembers(
        projectId,
        session.user.id,
      );
    return response;
  }

  @Message(ResponseMessage.UPDATE_PROJECT_MEMBER_SUCCESS)
  @Put(':projectId/member/:memberId/update')
  async updateProjectMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ) {
    const response = await this.projectMemberService.updateProjectMember(
      projectId,
      memberId,
    );
    return response;
  }

  @Role('OWNER')
  @Message(ResponseMessage.DELETE_PROJECT_MEMBER_SUCCESS)
  @Delete(':projectId/member/:memberId/remove')
  async removeProjectMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.projectMemberService.removeProjectMember(
      projectId,
      memberId,
      session.user.id,
    );
    return response;
  }

  @Role('OWNER')
  @Message(ResponseMessage.INVITE_PROJECT_MEMBER_SUCCESS)
  @Post(':projectId/invite')
  async inviteProjectMembers(
    @Param('projectId') projectId: string,
    @Body() request: InviteProjectMemberRequest,
    @Session() session: UserSession,
  ) {
    const response = await this.projectMemberService.inviteProjectMembers(
      projectId,
      request.userIds,
      session.user.id,
    );
    return response;
  }
}
