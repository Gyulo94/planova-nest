import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentWorkspaceMember = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceMember;
  },
);
