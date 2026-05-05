import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { ProjectWithImage } from 'src/global/types';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProjectCreateInput): Promise<ProjectWithImage> {
    return this.prisma.project.create({
      data,
      include: {
        image: true,
      },
    });
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<ProjectWithImage[]> {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        image: true,
      },
    });
  }

  async findProjectById(id: string): Promise<ProjectWithImage | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  update(
    projectId: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectWithImage> {
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
}
