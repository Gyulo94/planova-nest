import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorCodeMap } from 'src/global/enums/error-code.enum';
import { ApiException } from 'src/global/exceptions/api.exception';
import type { LoggerService } from '@nestjs/common';
import { format } from 'date-fns';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const message = exception.message;

    if (
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.NOT_FOUND ||
      status === HttpStatus.CONFLICT ||
      status === HttpStatus.BAD_REQUEST
    ) {
      this.logger.warn(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    } else {
      this.logger.error(
        `[CODE : ${status}] [${request.method} : ${request.url}] / [${message}] `,
      );
    }

    let responseBody: any = {
      statusCode: status,
      message: message,
      path: request.url,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    if (exception instanceof ApiException) {
      const customErrorCode = exception.getErrorCode();
      const enumDetail = ErrorCodeMap[customErrorCode];
      responseBody.message =
        message || (enumDetail ? enumDetail.message : '알 수 없는 에러');
      responseBody.code = customErrorCode;
    }
    response.status(status).json(responseBody);
  }
}
