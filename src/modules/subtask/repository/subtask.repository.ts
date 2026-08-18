import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubtaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SubtaskUncheckedCreateInput) {
    return this.prisma.subtask.create({
      data,
      include: { task: { include: { project: true } } },
    });
  }

  async update(id: string, data: Prisma.SubtaskUpdateInput) {
    return this.prisma.subtask.update({
      where: { id },
      data,
      include: { task: { include: { project: true } } },
    });
  }

  async delete(id: string) {
    return this.prisma.subtask.delete({
      where: { id },
      include: { task: { include: { project: true } } },
    });
  }

  async findByTaskId(taskId: string) {
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.subtask.findUnique({
      where: { id },
      include: { task: { include: { project: true } } },
    });
  }

  async getNextOrder(taskId: string): Promise<number> {
    const lastSubtask = await this.prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { order: 'desc' },
    });
    return lastSubtask ? lastSubtask.order + 1 : 0;
  }

  async updateTaskProgress(taskId: string) {
    const subtasks = await this.prisma.subtask.findMany({
      where: { taskId },
    });

    if (subtasks.length === 0) {
      return await this.prisma.task.update({
        where: { id: taskId },
        data: { progress: 0 },
        include: {
          project: true,
        },
      });
    }

    const completedCount = subtasks.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / subtasks.length) * 100);

    return await this.prisma.task.update({
      where: { id: taskId },
      data: { progress },
      include: {
        project: true,
      },
    });
  }
}
