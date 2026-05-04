import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class ProjectMemberRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(projectId: string, userId: string) {
    return await this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: 'OWNER',
      },
    });
  }
}
