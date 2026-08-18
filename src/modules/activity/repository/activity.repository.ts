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
