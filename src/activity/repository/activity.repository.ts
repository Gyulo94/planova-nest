import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ActivityUncheckedCreateInput) {
    return this.prisma.activity.create({
      data,
    });
  }

  async findActivities(params: {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    userId?: string;
    skip?: number;
    take?: number;
  }) {
    const { workspaceId, projectId, taskId, userId, skip, take } = params;
    return this.prisma.activity.findMany({
      where: {
        workspaceId,
        projectId,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
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
  }) {
    return this.prisma.activity.findFirst({
      where: {
        taskId: params.taskId,
        userId: params.userId,
        action: params.action,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
