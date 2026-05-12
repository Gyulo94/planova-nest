import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CommentDetailPayload, CommentPayload } from 'src/global/types';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    content: string;
    taskId: string;
    userId: string;
  }): Promise<CommentPayload> {
    return this.prisma.comment.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<CommentDetailPayload | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  async update(id: string, content: string): Promise<CommentPayload> {
    return this.prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async findByTaskId(taskId: string): Promise<CommentPayload[]> {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
      },
    });
  }
}
