import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MilestoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MilestoneCreateInput) {
    return this.prisma.milestone.create({
      data,
      include: {
        project: true,
        Task: {
          select: { status: true },
        },
      },
    });
  }

  async findAllByProjectId(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        project: true,
        Task: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
        Task: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.MilestoneUpdateInput) {
    return this.prisma.milestone.update({
      where: { id },
      data,
      include: {
        project: true,
        Task: {
          select: { status: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.milestone.delete({
      where: { id },
    });
  }
}
