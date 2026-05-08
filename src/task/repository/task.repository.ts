import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNextTaskNumber(projectId: string): Promise<number> {
    const count = await this.prisma.task.count({ where: { projectId } });
    return count + 1;
  }

  async create(
    data: Prisma.TaskCreateInput,
    assigneeId: string,
    labelId?: string,
  ) {
    return this.prisma.task.create({
      data: {
        ...data,
        taskAssignee: {
          create: { userId: assigneeId },
        },
        ...(labelId && {
          taskLabel: {
            create: { labelId },
          },
        }),
      },
      include: { project: true },
    });
  }

  async getById(taskId: string) {
    return this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        approval: {
          include: { user: true },
        },
        taskAssignee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        taskLabel: {
          include: {
            label: {
              select: {
                id: true,
                name: true,
                bgColor: true,
                textColor: true,
              },
            },
          },
        },
        subtask: {
          orderBy: { order: 'asc' },
        },
        epic: true,
        milestone: true,
      },
    });
  }

  async createApproval(taskId: string, userId: string) {
    return this.prisma.approval.create({
      data: {
        taskId,
        userId,
      },
    });
  }

  async findApprovalsByTaskId(taskId: string) {
    return this.prisma.approval.findMany({
      where: { taskId },
      include: { user: true },
    });
  }

  async findByIds(taskIds: string[]) {
    return this.prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { project: true },
    });
  }

  async findTasksByProjectId(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
      include: {
        project: true,
        taskAssignee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        taskLabel: {
          include: {
            label: {
              select: {
                id: true,
                name: true,
                bgColor: true,
                textColor: true,
              },
            },
          },
        },
        epic: true,
        milestone: true,
      },
    });
  }

  async update(taskId: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        project: true,
        approval: {
          include: { user: true },
        },
        taskAssignee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        taskLabel: {
          include: {
            label: {
              select: {
                id: true,
                name: true,
                bgColor: true,
                textColor: true,
              },
            },
          },
        },
        subtask: {
          orderBy: { order: 'asc' },
        },
        epic: true,
        milestone: true,
      },
    });
  }

  async reorder(data: { id: string; order: number; status: TaskStatus }[]) {
    const results: Task[] = [];

    for (const { id, order, status } of data) {
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: { order, status },
      });
      results.push(updatedTask);
    }

    return results;
  }

  async updateDescription(taskId: string, description: string): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: { description },
    });
  }

  async delete(taskId: string) {
    return this.prisma.task.delete({
      where: { id: taskId },
      include: { project: true },
    });
  }
}
