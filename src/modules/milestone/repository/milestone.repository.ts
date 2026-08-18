import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MilestonePayload } from 'src/global';

@Injectable()
export class MilestoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MilestoneCreateInput): Promise<MilestonePayload> {
    return this.prisma.milestone.create({
      data,
      include: {
        project: true,
        epics: true,
      },
    });
  }

  async findAllByProjectId(projectId: string): Promise<MilestonePayload[]> {
    return this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        project: true,
        epics: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findById(id: string): Promise<MilestonePayload | null> {
    return this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
        epics: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.MilestoneUpdateInput,
  ): Promise<MilestonePayload> {
    return this.prisma.milestone.update({
      where: { id },
      data,
      include: {
        project: true,
        epics: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.milestone.delete({
      where: { id },
    });
  }
}
