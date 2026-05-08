import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EpicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EpicCreateInput) {
    return this.prisma.epic.create({
      data,
      include: {
        project: true,
        _count: {
          select: { task: true },
        },
      },
    });
  }

  async findAllByProjectId(projectId: string) {
    return this.prisma.epic.findMany({
      where: { projectId },
      include: {
        project: true,
        _count: {
          select: { task: true },
        },
        task: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.epic.findUnique({
      where: { id },
      include: {
        project: true,
        _count: {
          select: { task: true },
        },
        task: {
          include: {
            taskAssignee: {
              include: {
                user: true,
              },
            },
            taskLabel: {
              include: {
                label: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.EpicUpdateInput) {
    return this.prisma.epic.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.epic.delete({
      where: { id },
    });
  }

  async findLastEpicNumber(workspaceId: string) {
    const lastEpic = await this.prisma.epic.findFirst({
      where: { workspaceId },
      orderBy: { epicNumber: 'desc' },
      select: { epicNumber: true },
    });
    return lastEpic?.epicNumber || 0;
  }
}
