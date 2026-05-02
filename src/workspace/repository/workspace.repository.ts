import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { WorkspaceWithImage } from 'src/global/types';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkspaceCreateInput): Promise<WorkspaceWithImage> {
    return this.prisma.workspace.create({
      data,
      include: {
        image: true,
      },
    });
  }
}
