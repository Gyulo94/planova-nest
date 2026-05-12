import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../global/prisma/prisma.service';
import { ProjectPayload } from '../../global/types';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProjectCreateInput): Promise<ProjectPayload> {
    return this.prisma.project.create({
      data,
      include: {
        image: true,
      },
    });
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<ProjectPayload[]> {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        image: true,
      },
    });
  }

  async findProjectById(id: string): Promise<ProjectPayload | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  update(
    projectId: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectPayload> {
    return this.prisma.project.update({
      where: { id: projectId },
      data,
      include: { image: true },
    });
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({
      where: { id: projectId },
    });
    return true;
  }
  async getTaskStatusCounts(projectId: string) {
    const [todo, inProgress, review, done, total] = await Promise.all([
      this.prisma.task.count({ where: { projectId, status: 'TODO' } }),
      this.prisma.task.count({ where: { projectId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { projectId, status: 'REVIEW' } }),
      this.prisma.task.count({ where: { projectId, status: 'DONE' } }),
      this.prisma.task.count({ where: { projectId } }),
    ]);
    return { todo, inProgress, review, done, total };
  }
}
