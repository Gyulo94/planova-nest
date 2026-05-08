import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { WorkspaceWithImage } from 'src/global/types';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkspaceCreateInput): Promise<WorkspaceWithImage> {
    return this.prisma.workspace.create({
      data,
      include: {
        image: true,
      },
    });
  }

  async findWorkspaceById(id: string): Promise<WorkspaceWithImage | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  async update(
    data: Prisma.WorkspaceUpdateInput,
    id: string,
  ): Promise<WorkspaceWithImage> {
    return this.prisma.workspace.update({
      where: { id },
      data,
      include: { image: true },
    });
  }

  async delete(workspaceId: string): Promise<boolean> {
    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
    return true;
  }

  async resetInviteCode(
    workspaceId: string,
    newInviteCode: string,
  ): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { inviteCode: newInviteCode },
    });
  }

  async getWorkspaceStats(workspaceId: string) {
    const [projectCount, memberCount, taskCounts] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { project: { workspaceId } },
        _count: true,
      }),
    ]);

    const stats = {
      projects: projectCount,
      members: memberCount,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      total: 0,
    };

    taskCounts.forEach((group) => {
      const count = group._count;
      stats.total += count;
      if (group.status === 'TODO') stats.todo = count;
      if (group.status === 'IN_PROGRESS') stats.inProgress = count;
      if (group.status === 'REVIEW') stats.review = count;
      if (group.status === 'DONE') stats.done = count;
    });

    return stats;
  }
}
