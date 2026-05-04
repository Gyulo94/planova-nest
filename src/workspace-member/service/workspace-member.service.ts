import { Injectable } from '@nestjs/common';
import { WorkspaceMemberRepository } from '../repository/workspace-member.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { WorkspaceMemberResponse } from '../response/workspace-member.response';
import { WorkspaceResponse } from 'src/workspace/response/workspace.response';
import { WorkspaceMemberRequest } from '../reuqest/workspace-member.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
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
    const response = WorkspaceMemberResponse.fromModel(newWorkspaceMember);
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
    await this.workspaceMemberRepository.delete(workspaceId, memberId);
  }
}
