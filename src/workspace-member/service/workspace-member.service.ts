import { Injectable } from '@nestjs/common';
import { WorkspaceMemberRepository } from '../repository/workspace-member.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { WorkspaceMemberResponse } from '../response/workspace-member.response';
import { WorkspaceResponse } from 'src/workspace/response/workspace.response';

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

  async findWorkspaceMembers(workspaceId: string, userId: string) {
    await this.validateWorkspaceMember(workspaceId, userId);
    const workspaceMembers =
      await this.workspaceMemberRepository.findWorkspaceMembers(
        workspaceId,
        userId,
      );
    const response = workspaceMembers.map((member) =>
      WorkspaceMemberResponse.fromModel(member),
    );
    return response;
  }

  async validateWorkspaceMember(workspaceId: string, userId: string) {
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
}
