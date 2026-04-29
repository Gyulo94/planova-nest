import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(
      JSON.stringify({
        url: req.url,
        method: req.method,
        body: req.body,
      }),
    );
    next();
  }
}
