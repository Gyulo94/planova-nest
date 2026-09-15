import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const documentationInclude = {
  project: true,
  versions: {
    include: { createdBy: true },
    orderBy: { version: 'desc' as const },
  },
} as const;

const generationInclude = {
  task: {
    include: {
      assignee: true,
      label: true,
      epic: true,
      subtask: { orderBy: { order: 'asc' as const } },
    },
    orderBy: { taskNumber: 'asc' as const },
  },
  epic: {
    include: { tasks: true, milestone: true },
    orderBy: { epicNumber: 'asc' as const },
  },
  milestone: {
    include: { epics: { include: { tasks: true } } },
    orderBy: { milestoneNumber: 'asc' as const },
  },
  troubleshooting: {
    include: { task: true },
    orderBy: { createdAt: 'asc' as const },
  },
  projectMember: {
    include: { user: true },
    orderBy: { joinedAt: 'asc' as const },
  },
} as const;

export type ProjectDocumentationPayload =
  Prisma.ProjectDocumentationGetPayload<{
    include: typeof documentationInclude;
  }>;

export type ProjectDocumentationSource = Prisma.ProjectGetPayload<{
  include: typeof generationInclude;
}>;

@Injectable()
export class ProjectDocumentationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProjectId(projectId: string) {
    return this.prisma.projectDocumentation.findUnique({
      where: { projectId },
      include: documentationInclude,
    });
  }

  findVersionById(versionId: string) {
    return this.prisma.projectDocumentationVersion.findUnique({
      where: { id: versionId },
      include: {
        createdBy: true,
        documentation: true,
      },
    });
  }

  findGenerationSource(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: generationInclude,
    });
  }

  createDocumentation(
    projectId: string,
    userId: string,
    version: {
      title: string;
      content: string;
      sourceSummary: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.projectDocumentation.create({
      data: {
        project: { connect: { id: projectId } },
        versions: {
          create: {
            version: 1,
            title: version.title,
            content: version.content,
            sourceSummary: version.sourceSummary,
            createdBy: { connect: { id: userId } },
          },
        },
      },
      include: documentationInclude,
    });
  }

  async createVersion(
    documentationId: string,
    userId: string,
    version: {
      title: string;
      content: string;
      sourceSummary?: Prisma.InputJsonValue;
    },
  ) {
    const latest = await this.prisma.projectDocumentationVersion.findFirst({
      where: { documentationId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    await this.prisma.projectDocumentationVersion.create({
      data: {
        documentation: { connect: { id: documentationId } },
        createdBy: { connect: { id: userId } },
        version: (latest?.version ?? 0) + 1,
        title: version.title,
        content: version.content,
        sourceSummary: version.sourceSummary,
      },
    });
    await this.prisma.projectDocumentation.update({
      where: { id: documentationId },
      data: { updatedAt: new Date() },
    });
    return this.prisma.projectDocumentation.findUniqueOrThrow({
      where: { id: documentationId },
      include: documentationInclude,
    });
  }

  async updateVersion(versionId: string, title: string, content: string) {
    const updated = await this.prisma.projectDocumentationVersion.update({
      where: { id: versionId },
      data: { title, content },
      select: { documentationId: true },
    });
    await this.prisma.projectDocumentation.update({
      where: { id: updated.documentationId },
      data: { updatedAt: new Date() },
    });
    return this.prisma.projectDocumentation.findUniqueOrThrow({
      where: { id: updated.documentationId },
      include: documentationInclude,
    });
  }
}
