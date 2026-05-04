import { Injectable } from '@nestjs/common';
import { Prisma, Role, WorkspaceMember } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { WorkspaceWithImage } from 'src/global/types';
import { WorkspaceMemberWithUserAndWorkspace } from 'src/global/types/workspace-member';

@Injectable()
export class WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    return await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: 'OWNER',
      },
    });
  }

  async findByUserId(userId: string): Promise<WorkspaceWithImage[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: { include: { image: true } } },
      orderBy: { joinedAt: 'desc' },
    });

    return members.map((m) => m.workspace);
  }

  async validateWorkspaceMember(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    return !!member;
  }

  async findWorkspaceMembers(
    workspaceId: string,
  ): Promise<WorkspaceMemberWithUserAndWorkspace[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: true,
        workspace: { include: { image: true } },
      },
    });
    return members;
  }

  add(
    data: Prisma.WorkspaceMemberCreateInput,
  ): Promise<WorkspaceMemberWithUserAndWorkspace> {
    return this.prisma.workspaceMember.create({
      data,
      include: {
        user: true,
        workspace: { include: { image: true } },
      },
    });
  }

  update(
    workspaceId: string,
    memberId: string,
    newRole: Role,
  ): Promise<WorkspaceMemberWithUserAndWorkspace> {
    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: true,
        workspace: { include: { image: true } },
      },
    });
  }

  async delete(workspaceId: string, memberId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });
  }

  findMyOwnWorkspaces(userId: string) {
    return this.prisma.workspaceMember.findMany({
      where: {
        userId,
        role: 'OWNER',
      },
      include: {
        workspace: { include: { image: true } },
      },
    });
  }
}
