import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createSocialUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async resetPassword(data: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(data);
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const ownedWorkspaces = await tx.workspace.findMany({
        where: { ownerId: id },
      });

      for (const workspace of ownedWorkspaces) {
        await tx.workspace.delete({ where: { id: workspace.id } });
      }

      await tx.workspaceMember.deleteMany({ where: { userId: id } });
      await tx.projectMember.deleteMany({ where: { userId: id } });

      await tx.approval.deleteMany({ where: { userId: id } });
      await tx.comment.deleteMany({ where: { userId: id } });
      await tx.activity.deleteMany({ where: { userId: id } });

      await tx.epic.deleteMany({ where: { createdById: id } });
      await tx.idea.deleteMany({ where: { createdById: id } });
      await tx.backlog.deleteMany({ where: { createdById: id } });

      return tx.user.delete({
        where: { id },
      });
    });
  }
}
