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

  async findWorkspaceById(id: string): Promise<WorkspaceWithImage | null> {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: { image: true },
    });
  }

  async update(
    data: Prisma.WorkspaceUpdateInput,
    id: string,
  ): Promise<WorkspaceWithImage> {
    return this.prisma.workspace.update({
      where: { id },
      data,
      include: { image: true },
    });
  }

  async delete(workspaceId: string): Promise<boolean> {
    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
    return true;
  }

  async resetInviteCode(
    workspaceId: string,
    newInviteCode: string,
  ): Promise<void> {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { inviteCode: newInviteCode },
    });
  }
}
