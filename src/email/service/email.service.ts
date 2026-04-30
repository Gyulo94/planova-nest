import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { EmailRequest } from '../request/email.request';
import { EmailServerRequest } from '../request/email-server.request';
import { UserService } from 'src/user/service/user.service';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';

import {
  APP_NAME,
  CLIENT_URL,
  EMAIL_URL,
  LOGO,
  SENDER_EMAIL,
  SENDER_PWD,
} from 'src/global/constants';

@Injectable()
export class EmailService {
  private readonly LOGGER = new Logger(EmailService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly redis: RedisService,
  ) {}

  async validateVerificationMailRequest(
    request: EmailRequest,
  ): Promise<EmailServerRequest> {
    if (!request.email) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    const user = await this.userService.findByEmail(request.email);

    if (request.type === 'register' && user) {
      throw new ApiException(ErrorCode.ALREADY_EXIST_EMAIL);
    }

    if (request.type === 'reset' && !user) {
      throw new ApiException(ErrorCode.EMAIL_NOT_FOUND);
    }

    if (user && user.provider !== 'LOCAL') {
      throw new ApiException(ErrorCode.RESET_PASSWORD_NOT_ALLOWED_SOCIAL_USER);
    }

    return EmailServerRequest.toModel({
      serviceName: APP_NAME,
      clientUrl: CLIENT_URL,
      logo: LOGO,
      senderEmail: SENDER_EMAIL,
      senderPwd: SENDER_PWD,
      email: request.email,
      type: request.type,
    });
  }

  sendVerificationMailInBackground(emailRequest: EmailServerRequest): void {
    void firstValueFrom(
      this.httpService.post(`${EMAIL_URL}/send`, emailRequest),
    ).catch((error) => {
      this.LOGGER.error('이메일 발송 요청 실패', error);
    });
  }

  async verifyEmail(request: EmailRequest) {
    if (!request.token) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    const verifyPayload = {
      serviceName: APP_NAME,
      token: request.token,
      type: request.type,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ body?: { email?: string } }>(
          `${EMAIL_URL}/verify`,
          verifyPayload,
        ),
      );

      const email = response.data?.body?.email;
      if (!email) {
        throw new ApiException(ErrorCode.FORBIDDEN);
      }

      if (request.type === 'register') {
        await this.userService.completeRegister(email, request.token!);
      }

      return { email };
    } catch (error) {
      if (error instanceof ApiException) throw error;

      this.LOGGER.error('이메일 검증 처리 중 오류 발생', error);
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
