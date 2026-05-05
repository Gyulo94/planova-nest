import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie';
import { Socket } from 'socket.io';
import { JWT_SECRET_KEY } from '../constants';
import type { Payload } from '../types';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../enums/error-code.enum';

@Injectable()
export class WsAuthService {
  constructor(private readonly jwtService: JwtService) {}

  authenticate(client: Socket): Payload {
    const rawCookie = client.handshake.headers.cookie || '';
    const cookies = cookieParser.parse(rawCookie);
    const token = cookies['accessToken'];

    if (!token) {
      throw new ApiException(ErrorCode.ACCESS_TOKEN_NOT_FOUND);
    }

    return this.jwtService.verify<Payload>(token, {
      secret: JWT_SECRET_KEY,
    });
  }
}
