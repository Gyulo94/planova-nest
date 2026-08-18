import { Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../enums/error-code.enum';
import type { Auth } from 'better-auth';

@Injectable()
export class WsAuthService {
  constructor(@Inject('BETTER_AUTH') private readonly auth: Auth) {}

  async authenticate(client: Socket) {
    const headers = new Headers();
    const rawCookie = client.handshake.headers.cookie;

    if (rawCookie) {
      headers.set('cookie', rawCookie);
    }
    const session = await this.auth.api.getSession({
      headers,
    });

    if (!session || !session.user) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }

    client.data.user = session.user;
    client.data.session = session.session;

    return session;
  }
}
