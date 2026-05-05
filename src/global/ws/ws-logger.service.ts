import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsLoggerService {
  private readonly LOGGER = new Logger(WsLoggerService.name);

  logConnected(client: Socket, userId: string) {
    this.LOGGER.debug(
      `소켓 연결됨: socketId=${client.id}, userId=${userId}, ip=${client.handshake.address}`,
    );
  }

  logDisconnected(client: Socket) {
    this.LOGGER.debug(
      `소켓 연결 해제됨: socketId=${client.id}, ip=${client.handshake.address}`,
    );
  }

  logConnectionError(client: Socket, error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    this.LOGGER.warn(
      `소켓 연결 거부됨: socketId=${client.id}, ip=${client.handshake.address}, reason=${message}`,
    );
  }
}
