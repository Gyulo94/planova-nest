import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IdeaPayload } from 'src/global/types/idea';

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.IdeaCreateInput): Promise<IdeaPayload> {
    return this.prisma.idea.create({
      data,
      include: {
        project: true,
        user: true,
        workspace: true,
        task: true,
        label: true,
      },
    });
  }

  async findAllByProjectId(projectId: string): Promise<IdeaPayload[]> {
    return this.prisma.idea.findMany({
      where: { projectId },
      include: {
        project: true,
        user: true,
        workspace: true,
        task: true,
        label: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async reorder(updates: { id: string; order: number }[]) {
    const results: any[] = [];
    for (const { id, order } of updates) {
      const updated = await this.prisma.idea.update({
        where: { id },
        data: { order },
      });
      results.push(updated);
    }
    return results;
  }

  async findById(id: string): Promise<IdeaPayload | null> {
    return this.prisma.idea.findUnique({
      where: { id },
      include: {
        project: true,
        user: true,
        workspace: true,
        task: true,
        label: true,
      },
    });
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<IdeaPayload> {
    return this.prisma.idea.update({
      where: { id },
      data,
      include: {
        project: true,
        user: true,
        workspace: true,
        task: true,
        label: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.idea.delete({
      where: { id },
    });
  }
}
