import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActivityPayload } from 'src/global/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ActivityCreateInput): Promise<ActivityPayload> {
    return this.prisma.activity.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findActivities(params: {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    userId?: string;
    skip?: number;
    take?: number;
  }): Promise<ActivityPayload[]> {
    const { workspaceId, projectId, taskId, userId, skip, take } = params;
    return this.prisma.activity.findMany({
      where: {
        workspaceId,
        projectId,
        taskId,
        userId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async findProjectActivityHistory(params: {
    projectId: string;
    userId?: string;
    from?: Date;
    to?: Date;
    actionPrefixes?: string[];
    skip: number;
    take: number;
  }): Promise<[ActivityPayload[], number]> {
    const { projectId, userId, from, to, actionPrefixes, skip, take } = params;
    const where: Prisma.ActivityWhereInput = {
      projectId,
      userId,
      createdAt:
        from || to
          ? {
              gte: from,
              lte: to,
            }
          : undefined,
      OR: actionPrefixes?.map((prefix) => ({
        action: { startsWith: prefix },
      })),
    };

    return this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        include: { user: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.activity.count({ where }),
    ]);
  }

  async findWorkspaceActivityHistory(params: {
    workspaceId: string;
    projectId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
    actionPrefixes?: string[];
    skip: number;
    take: number;
  }): Promise<[ActivityPayload[], number]> {
    const {
      workspaceId,
      projectId,
      userId,
      from,
      to,
      actionPrefixes,
      skip,
      take,
    } = params;
    const where: Prisma.ActivityWhereInput = {
      workspaceId,
      projectId,
      userId,
      createdAt:
        from || to
          ? {
              gte: from,
              lte: to,
            }
          : undefined,
      OR: actionPrefixes?.map((prefix) => ({
        action: { startsWith: prefix },
      })),
    };

    return this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        include: { user: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.activity.count({ where }),
    ]);
  }

  async findProjectSummariesByIds(projectIds: string[]) {
    if (projectIds.length === 0) return [];
    return this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });
  }

  async findLastActivity(params: {
    taskId?: string;
    userId: string;
    action: string;
  }): Promise<ActivityPayload | null> {
    return this.prisma.activity.findFirst({
      where: {
        taskId: params.taskId,
        userId: params.userId,
        action: params.action,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
