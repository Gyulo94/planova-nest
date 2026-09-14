import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const include = { task: true, project: true } as const;

export type TroubleshootingPayload = Prisma.TroubleshootingGetPayload<{
  include: typeof include;
}>;

@Injectable()
export class TroubleshootingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTaskById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(
    data: Prisma.TroubleshootingCreateInput,
  ): Promise<TroubleshootingPayload> {
    return this.prisma.troubleshooting.create({ data, include });
  }

  findAllByProjectId(projectId: string): Promise<TroubleshootingPayload[]> {
    return this.prisma.troubleshooting.findMany({
      where: { projectId },
      include,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string): Promise<TroubleshootingPayload | null> {
    return this.prisma.troubleshooting.findUnique({ where: { id }, include });
  }

  update(
    id: string,
    data: Prisma.TroubleshootingUpdateInput,
  ): Promise<TroubleshootingPayload> {
    return this.prisma.troubleshooting.update({ where: { id }, data, include });
  }

  delete(id: string): Promise<TroubleshootingPayload> {
    return this.prisma.troubleshooting.delete({ where: { id }, include });
  }
}
