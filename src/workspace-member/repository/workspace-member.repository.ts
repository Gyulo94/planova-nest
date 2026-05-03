import { Injectable } from '@nestjs/common';
import { WorkspaceMember } from '@prisma/client';
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
    userId: string,
  ): Promise<WorkspaceMemberWithUserAndWorkspace[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId,
      },
      include: {
        user: true,
        workspace: true,
      },
    });
    return members;
  }
}
