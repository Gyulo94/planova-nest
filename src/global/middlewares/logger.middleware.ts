import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { NODE_ENV } from '../constants';
@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (NODE_ENV === 'development') {
      this.logger.log(
        JSON.stringify({
          url: req.url,
          method: req.method,
          body: req.body,
        }),
      );
    } else {
      this.logger.log(
        JSON.stringify({
          url: req.url,
          method: req.method,
          ip: req.ip,
        }),
      );
    }
    next();
  }
}
