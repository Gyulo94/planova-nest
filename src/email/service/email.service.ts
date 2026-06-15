import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import {
  APP_NAME,
  CLIENT_URL,
  EMAIL_URL,
  LOGO,
  SENDER_EMAIL,
  SENDER_PWD,
} from 'src/global/constants';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { RedisKey } from 'src/global/redis/redis.key';

export interface SendVerificationParams {
  email: string;
  type: string;
  payload: any;
}

@Injectable()
export class EmailService {
  constructor(private readonly redis: RedisService) {}

  async sendVerificationEmail({
    email,
    type,
    payload,
  }: SendVerificationParams) {
    const token = uuid();

    let redisKey: string | undefined;
    if (type === 'register') {
      redisKey = RedisKey.verificationRegister(token);
    } else if (type === 'reset') {
      redisKey = RedisKey.verificationReset(token);
    }

    if (!redisKey) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    await this.redis.set(redisKey, JSON.stringify(payload), 900);

    const path =
      type === 'register' ? 'register/verify' : 'reset-password/verify';
    const url = `${CLIENT_URL}/${path}?token=${token}`;

    try {
      await axios.post(EMAIL_URL || '', {
        serviceName: APP_NAME,
        logo: LOGO,
        senderEmail: SENDER_EMAIL,
        senderPwd: SENDER_PWD,
        email,
        type,
        url,
      });
    } catch (error) {
      await this.redis.del(redisKey);
      console.error('이메일 발송 실패: ', error);
    }
  }
}
