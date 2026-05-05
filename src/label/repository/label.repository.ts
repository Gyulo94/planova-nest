import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_TASK_LABELS } from 'src/global/constants';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class LabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LabelCreateInput) {
    return this.prisma.label.create({ data });
  }

  async createMany(projectId: string) {
    const data = DEFAULT_TASK_LABELS.map((label) => ({
      ...label,
      projectId,
    }));
    return this.prisma.label.createMany({ data });
  }

  async findByProjectId(projectId: string) {
    return this.prisma.label.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        bgColor: true,
        textColor: true,
      },
    });
  }
}
