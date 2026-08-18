import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectMemberRepository } from '../repository/project-member.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { ProjectMemberResponse } from '../response/project-member.response';
import { WorkspaceMemberResponse } from 'src/modules/workspace-member/response/workspace-member.response';
import { ActivityService } from 'src/modules/activity/service/activity.service';

@Injectable()
export class ProjectMemberService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createProjectMember(projectId: string, userId: string) {
    const response = await this.projectMemberRepository.create(
      projectId,
      userId,
    );
    return response;
  }

  async findProjectMembers(
    projectId: string,
  ): Promise<ProjectMemberResponse[]> {
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
    const newProjectMembers = await Promise.all(
      userIds.map((userId) =>
        this.projectMemberRepository.add(projectId, userId),
      ),
    );

    await Promise.all(
      newProjectMembers.map((member) =>
        this.activityService.createActivity({
          action: 'PROJECT_MEMBER_INVITED',
          description: `'${member.user.name || member.user.email}'님을 프로젝트에 초대했습니다.`,
          workspaceId: member.project.workspaceId,
          projectId,
          userId,
          metadata: { invitedUserId: member.userId },
        }),
      ),
    );

    const response = newProjectMembers.map((member) =>
      ProjectMemberResponse.fromModel(member),
    );
    this.eventEmitter.emit('project.member.invited', {
      workspaceId: newProjectMembers[0].project.workspaceId,
      projectId,
      members: response,
    });
    return response;
  }

  async findAvailableWorkspaceMembers(
    projectId: string,
    userId: string,
  ): Promise<WorkspaceMemberResponse[]> {
    const workspaceMembers =
      await this.projectMemberRepository.findWorkspaceMembersNotInProject(
        projectId,
      );
    const response = workspaceMembers.map((member) =>
      WorkspaceMemberResponse.fromModel(member),
    );
    return response;
  }

  async updateProjectMember(projectId: string, memberId: string) {
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

    await this.activityService.createActivity({
      action: 'PROJECT_MEMBER_REMOVED',
      description: `'${member.user.name || member.user.email}'님을 프로젝트에서 내보냈습니다.`,
      workspaceId: member.project.workspaceId,
      projectId,
      userId,
      metadata: { removedUserId: memberId },
    });

    this.eventEmitter.emit('project.member.removed', {
      workspaceId: member.project.workspaceId,
      projectId,
      memberId,
    });
  }

  findMyOwnProjects(userId: string) {
    const myProjects = this.projectMemberRepository.findMyOwnProjects(userId);
    return myProjects;
  }
}
