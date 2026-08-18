import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Auth } from 'better-auth';
import { ApiException, ErrorCode, IS_PUBLIC_KEY } from 'src/global';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('BETTER_AUTH') private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const session = await this.auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        throw new ApiException(ErrorCode.UNAUTHORIZED);
      }

      request.user = session.user;
      request.session = session.session;

      return true;
    } catch (error) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
  }
}
