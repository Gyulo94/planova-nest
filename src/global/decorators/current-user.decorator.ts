import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Payload } from 'src/global/types/payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Payload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as Payload;
  },
);
