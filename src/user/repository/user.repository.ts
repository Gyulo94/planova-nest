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

  async updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 사용자가 소유한 워크스페이스 조회
      const ownedWorkspaces = await tx.workspace.findMany({
        where: { ownerId: id },
      });

      // 소유한 워크스페이스 삭제 (Prisma 스키마의 Cascade 설정에 따라 프로젝트, 테스크 등 연쇄 삭제)
      for (const workspace of ownedWorkspaces) {
        await tx.workspace.delete({ where: { id: workspace.id } });
      }

      // 다른 워크스페이스/프로젝트의 멤버십 삭제
      await tx.workspaceMember.deleteMany({ where: { userId: id } });
      await tx.projectMember.deleteMany({ where: { userId: id } });

      // 활동 및 참여 기록 삭제
      await tx.approval.deleteMany({ where: { userId: id } });
      await tx.comment.deleteMany({ where: { userId: id } });
      await tx.activity.deleteMany({ where: { userId: id } });

      // 사용자가 생성한 에픽, 아이디어, 백로그 등
      await tx.epic.deleteMany({ where: { createdById: id } });
      await tx.idea.deleteMany({ where: { createdById: id } });
      await tx.backlog.deleteMany({ where: { createdById: id } });

      // 최종적으로 사용자 삭제
      return tx.user.delete({
        where: { id },
      });
    });
  }
}
