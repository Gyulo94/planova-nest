import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.body.workspaceId;

    if (!user || !workspaceId) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && !requiredRoles.includes(member.role)) {
      throw new ApiException(ErrorCode.WORKSPACE_MEMBER_ROLE_FORBIDDEN);
    }

    request.workspaceMember = member;
    return true;
  }
}
