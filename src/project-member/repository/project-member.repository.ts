import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { ProjectWithImage } from 'src/global/types';
import { ProjectMemberWithUserAndProject } from 'src/global/types/project-member';
import { WorkspaceMemberWithUserAndWorkspace } from 'src/global/types/workspace-member';

@Injectable()
export class ProjectMemberRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(projectId: string, userId: string) {
    return await this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: 'OWNER',
      },
    });
  }

  async findByUserIdAndWorkspaceId(
    userId: string,
    workspaceId: string,
  ): Promise<ProjectWithImage[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { userId, project: { workspaceId } },
      include: { project: { include: { image: true } } },
      orderBy: { joinedAt: 'desc' },
    });

    return members.map((m) => m.project);
  }

  async validateProjectMember(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    return !!member;
  }

  async findProjectMembers(
    projectId: string,
  ): Promise<ProjectMemberWithUserAndProject[]> {
    const members = await this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: true,
        project: { include: { image: true } },
      },
    });
    return members;
  }

  async findWorkspaceMembersNotInProject(
    projectId: string,
  ): Promise<WorkspaceMemberWithUserAndWorkspace[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      return [];
    }

    const projectMembers = await this.prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });
    const projectMemberIds = projectMembers.map((member) => member.userId);

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: project.workspaceId,
        userId:
          projectMemberIds.length > 0 ? { notIn: projectMemberIds } : undefined,
      },
      include: {
        user: true,
        workspace: { include: { image: true } },
      },
    });
  }

  add(
    projectId: string,
    userId: string,
  ): Promise<ProjectMemberWithUserAndProject> {
    return this.prisma.projectMember.create({
      data: {
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
        role: 'MEMBER',
      },
      include: {
        user: true,
        project: { include: { image: true } },
      },
    });
  }

  update(
    projectId: string,
    memberId: string,
    newRole: Role,
  ): Promise<ProjectMemberWithUserAndProject> {
    return this.prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: true,
        project: { include: { image: true } },
      },
    });
  }

  async delete(projectId: string, memberId: string): Promise<void> {
    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });
  }

  findMyOwnProjects(userId: string) {
    return this.prisma.projectMember.findMany({
      where: {
        userId,
        role: 'OWNER',
      },
      include: {
        project: { include: { image: true } },
      },
    });
  }
}
