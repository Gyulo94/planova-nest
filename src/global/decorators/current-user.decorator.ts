import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Payload } from 'src/global/types/payload';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
