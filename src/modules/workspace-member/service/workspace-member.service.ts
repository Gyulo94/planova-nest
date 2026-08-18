import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkspaceMemberRepository } from '../repository/workspace-member.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { WorkspaceMemberResponse } from '../response/workspace-member.response';
import { WorkspaceResponse } from 'src/modules/workspace/response/workspace.response';
import { WorkspaceMemberRequest } from '../reuqest/workspace-member.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { ProjectMemberRepository } from 'src/modules/project-member/repository/project-member.repository';
import { ProjectRepository } from 'src/modules/project/repository/project.repository';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly projectMemberRepository: ProjectMemberRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createWorkspaceMember(workspaceId: string, userId: string) {
    const response = await this.workspaceMemberRepository.create(
      workspaceId,
      userId,
    );
    return response;
  }

  async findWorkspaces(userId: string): Promise<WorkspaceResponse[]> {
    const myWorkspaces =
      await this.workspaceMemberRepository.findByUserId(userId);
    const response = myWorkspaces.map((workspace) =>
      WorkspaceResponse.fromModel(workspace),
    );
    return response;
  }

  async findWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberResponse[]> {
    await this.validateWorkspaceMember(workspaceId, userId);
    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(workspaceId);
    const response = workspaceMembers.map((member) =>
      WorkspaceMemberResponse.fromModel(member),
    );
    return response;
  }

  async validateWorkspaceMember(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const isMember: boolean =
      await this.workspaceMemberRepository.validateWorkspaceMember(
        workspaceId,
        userId,
      );
    if (!isMember) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }
    return isMember;
  }

  async validateWorkspaceAdminOrOwner(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(workspaceId);
    const member = workspaceMembers.find((m) => m.userId === userId);
    if (!member) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }
    if (member.role !== 'ADMIN' && member.role !== 'OWNER') {
      throw new ApiException(ErrorCode.INSUFFICIENT_ROLE);
    }
    return true;
  }

  async validateInviteCode(workspaceId: string, inviteCode: string) {
    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(workspaceId);
    const workspace = workspaceMembers[0]?.workspace;
    if (!workspace) {
      throw new ApiException(ErrorCode.WORKSPACE_NOT_FOUND);
    }
    if (workspace.inviteCode !== inviteCode) {
      throw new ApiException(ErrorCode.INVALID_INVITE_CODE);
    }
  }

  @Transactional()
  async joinWorkspace(request: WorkspaceMemberRequest, userId: string) {
    await this.validateInviteCode(request.workspaceId, request.inviteCode);
    const isMember =
      await this.workspaceMemberRepository.validateWorkspaceMember(
        request.workspaceId,
        userId,
      );
    if (isMember) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_ALREADY_EXISTS);
    }

    const newWorkspaceMember = await this.workspaceMemberRepository.add(
      WorkspaceMemberRequest.toModel(request, userId),
    );

    await this.activityService.createActivity({
      action: 'WORKSPACE_JOIN',
      description: `'${newWorkspaceMember.user.name || newWorkspaceMember.user.email}'님이 워크스페이스 '${newWorkspaceMember.workspace.name}'에 참여했습니다.`,
      workspaceId: request.workspaceId,
      userId,
    });

    const response = WorkspaceMemberResponse.fromModel(newWorkspaceMember);
    this.eventEmitter.emit('workspace.member.joined', {
      workspaceId: request.workspaceId,
      member: response,
    });
    return response;
  }

  async updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateWorkspaceMember(workspaceId, memberId);
    await this.validateWorkspaceAdminOrOwner(workspaceId, userId);

    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(workspaceId);
    const member = workspaceMembers.find((m) => m.userId === memberId);
    if (!member) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }
    if (member.role === 'OWNER') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const updatedWorkspaceMember = await this.workspaceMemberRepository.update(
      workspaceId,
      memberId,
      newRole,
    );
    const response = WorkspaceMemberResponse.fromModel(updatedWorkspaceMember);
    return response;
  }

  @Transactional()
  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateWorkspaceMember(workspaceId, memberId);
    await this.validateWorkspaceAdminOrOwner(workspaceId, userId);

    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(workspaceId);
    const member = workspaceMembers.find((m) => m.userId === memberId);
    if (!member) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }
    if (member.role === 'OWNER') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }

    const projectMemberships =
      await this.projectRepository.findProjectsByUserIdAndWorkspaceId(
        memberId,
        workspaceId,
      );
    const projectIds = projectMemberships.map((p) => p.id);

    await this.projectMemberRepository.deleteManyByWorkspaceId(
      workspaceId,
      memberId,
    );

    await this.workspaceMemberRepository.delete(workspaceId, memberId);

    await this.activityService.createActivity({
      action: 'WORKSPACE_MEMBER_REMOVED',
      description: `'${member.user.name || member.user.email}'님을 워크스페이스에서 내보냈습니다.`,
      workspaceId,
      userId,
      metadata: { removedUserId: memberId },
    });

    this.eventEmitter.emit('workspace.member.removed', {
      workspaceId,
      memberId,
    });

    projectIds.forEach((projectId) => {
      this.eventEmitter.emit('project.member.removed', {
        workspaceId,
        projectId,
        memberId,
      });
    });
  }

  findMyOwnWorkspaces(userId: string) {
    const myWorkspaces =
      this.workspaceMemberRepository.findMyOwnWorkspaces(userId);
    return myWorkspaces;
  }
}
