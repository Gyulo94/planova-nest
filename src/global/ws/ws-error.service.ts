import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsLoggerService } from './ws-logger.service';

@Injectable()
export class WsErrorService {
  constructor(private readonly wsLoggerService: WsLoggerService) {}

  handleConnectionError(client: Socket, error: unknown) {
    this.wsLoggerService.logConnectionError(client, error);
    client.disconnect(true);
  }
}
