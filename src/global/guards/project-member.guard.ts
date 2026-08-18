import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId || request.body.projectId;

    if (!user || !projectId) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && !requiredRoles.includes(member.role)) {
      throw new ApiException(ErrorCode.PROJECT_MEMBER_ROLE_FORBIDDEN);
    }

    request.projectMember = member;
    return true;
  }
}
