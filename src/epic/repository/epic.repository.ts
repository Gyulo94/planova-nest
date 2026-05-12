import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EpicPayload } from 'src/global/types';

@Injectable()
export class EpicRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly epicInclude = {
    project: true,
    user: true,
    workspace: true,
    _count: {
      select: { tasks: true },
    },
    tasks: true,
    milestone: true,
  };

  async create(data: Prisma.EpicCreateInput): Promise<EpicPayload> {
    return this.prisma.epic.create({
      data,
      include: this.epicInclude,
    });
  }

  async findAllByProjectId(projectId: string): Promise<EpicPayload[]> {
    return this.prisma.epic.findMany({
      where: { projectId },
      include: this.epicInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<EpicPayload | null> {
    return this.prisma.epic.findUnique({
      where: { id },
      include: this.epicInclude,
    });
  }

  async update(id: string, data: Prisma.EpicUpdateInput): Promise<EpicPayload> {
    return this.prisma.epic.update({
      where: { id },
      data,
      include: this.epicInclude,
    });
  }

  async delete(id: string): Promise<EpicPayload> {
    return this.prisma.epic.delete({
      where: { id },
      include: this.epicInclude,
    });
  }

  async findLastEpicNumber(workspaceId: string): Promise<number> {
    const lastEpic = await this.prisma.epic.findFirst({
      where: { workspaceId },
      orderBy: { epicNumber: 'desc' },
      select: { epicNumber: true },
    });
    return lastEpic?.epicNumber || 0;
  }
}
