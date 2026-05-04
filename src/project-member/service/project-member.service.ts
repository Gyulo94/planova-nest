import { Injectable } from '@nestjs/common';
import { ProjectMemberRepository } from '../repository/project-member.repository';
import { ProjectResponse } from 'src/project/response/project.response';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { ProjectMemberResponse } from '../response/project-member.response';
import { WorkspaceMemberResponse } from 'src/workspace-member/response/workspace-member.response';

@Injectable()
export class ProjectMemberService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
  ) {}

  async createProjectMember(projectId: string, userId: string) {
    const response = await this.projectMemberRepository.create(
      projectId,
      userId,
    );
    return response;
  }

  async findProjects(
    workspaceId: string,
    userId: string,
  ): Promise<ProjectResponse[]> {
    const myProjects =
      await this.projectMemberRepository.findByUserIdAndWorkspaceId(
        userId,
        workspaceId,
      );
    const response = myProjects.map((project) =>
      ProjectResponse.fromModel(project),
    );
    return response;
  }

  async findProjectMembers(
    projectId: string,
    userId: string,
  ): Promise<ProjectMemberResponse[]> {
    await this.validateProjectMember(projectId, userId);
    const projectMembers =
      await this.projectMemberRepository.findProjectMembers(projectId);
    const response = projectMembers.map((member) =>
      ProjectMemberResponse.fromModel(member),
    );
    return response;
  }

  async inviteProjectMembers(
    projectId: string,
    userIds: string[],
    userId: string,
  ): Promise<ProjectMemberResponse[]> {
    await this.validateProjectAdminOrOwner(projectId, userId);
    const newProjectMembers = await Promise.all(
      userIds.map((userId) =>
        this.projectMemberRepository.add(projectId, userId),
      ),
    );
    const response = newProjectMembers.map((member) =>
      ProjectMemberResponse.fromModel(member),
    );
    return response;
  }

  async findAvailableWorkspaceMembers(
    projectId: string,
    userId: string,
  ): Promise<WorkspaceMemberResponse[]> {
    await this.validateProjectAdminOrOwner(projectId, userId);
    const workspaceMembers =
      await this.projectMemberRepository.findWorkspaceMembersNotInProject(
        projectId,
      );
    const response = workspaceMembers.map((member) =>
      WorkspaceMemberResponse.fromModel(member),
    );
    return response;
  }

  async validateProjectMember(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const isMember: boolean =
      await this.projectMemberRepository.validateProjectMember(
        projectId,
        userId,
      );
    if (!isMember) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }
    return isMember;
  }

  async validateProjectAdminOrOwner(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const projectMembers =
      await this.projectMemberRepository.findProjectMembers(projectId);
    const member = projectMembers.find((m) => m.userId === userId);
    if (!member) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }
    if (member.role !== 'ADMIN' && member.role !== 'OWNER') {
      throw new ApiException(ErrorCode.INSUFFICIENT_ROLE);
    }
    return true;
  }

  async updateProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateProjectMember(projectId, memberId);
    await this.validateProjectAdminOrOwner(projectId, userId);

    const projectMembers =
      await this.projectMemberRepository.findProjectMembers(projectId);
    const member = projectMembers.find((m) => m.userId === memberId);
    if (!member) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }
    if (member.role === 'OWNER') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const updatedProjectMember = await this.projectMemberRepository.update(
      projectId,
      memberId,
      newRole,
    );
    const response = ProjectMemberResponse.fromModel(updatedProjectMember);
    return response;
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
  ) {
    await this.validateProjectMember(projectId, memberId);
    await this.validateProjectAdminOrOwner(projectId, userId);

    const projectMembers =
      await this.projectMemberRepository.findProjectMembers(projectId);
    const member = projectMembers.find((m) => m.userId === memberId);
    if (!member) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }
    if (member.role === 'OWNER') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    await this.projectMemberRepository.delete(projectId, memberId);
  }

  findMyOwnProjects(userId: string) {
    const myProjects = this.projectMemberRepository.findMyOwnProjects(userId);
    return myProjects;
  }
}
