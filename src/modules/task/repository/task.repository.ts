import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApprovalPayload,
  TaskDetailPayload,
  TaskPayload,
  TaskWithProject,
} from 'src/global/types';

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
  ): Promise<TaskPayload> {
    return this.prisma.task.create({
      data: {
        ...data,
        assignee: {
          connect: { id: assigneeId },
        },
        ...(labelId && {
          label: {
            connect: { id: labelId },
          },
        }),
      },
      include: {
        project: true,
        assignee: true,
        label: true,
        epic: true,
      },
    });
  }

  async getById(taskId: string): Promise<TaskDetailPayload | null> {
    return this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        approval: {
          include: { user: true },
        },
        assignee: true,
        label: true,
        subtask: {
          orderBy: { order: 'asc' },
        },
        epic: true,
      },
    });
  }

  async createApproval(
    taskId: string,
    userId: string,
  ): Promise<ApprovalPayload> {
    return this.prisma.approval.create({
      data: {
        taskId,
        userId,
      },
      include: { user: true },
    });
  }

  async findApprovalsByTaskId(taskId: string): Promise<ApprovalPayload[]> {
    return this.prisma.approval.findMany({
      where: { taskId },
      include: { user: true },
    });
  }

  async findByIds(taskIds: string[]): Promise<TaskWithProject[]> {
    return this.prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { project: true },
    });
  }

  async findTasksByProjectId(projectId: string): Promise<TaskPayload[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
      include: {
        project: true,
        assignee: true,
        label: true,
        epic: true,
      },
    });
  }

  async update(
    taskId: string,
    data: Prisma.TaskUpdateInput,
  ): Promise<TaskDetailPayload> {
    return this.prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        project: true,
        approval: {
          include: { user: true },
        },
        assignee: true,
        label: true,
        subtask: {
          orderBy: { order: 'asc' },
        },
        epic: true,
      },
    });
  }

  async reorder(
    data: { id: string; order: number; status: TaskStatus }[],
  ): Promise<Task[]> {
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

  async delete(taskId: string): Promise<TaskWithProject> {
    return this.prisma.task.delete({
      where: { id: taskId },
      include: { project: true },
    });
  }
}
