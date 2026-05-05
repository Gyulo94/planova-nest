import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from 'src/global/ws/ws-auth.service';
import { WsLoggerService } from 'src/global/ws/ws-logger.service';
import { WsErrorService } from 'src/global/ws/ws-error.service';
import { CLIENT_URL } from 'src/global/constants';

@WebSocketGateway({
  cors: {
    origin: [CLIENT_URL],
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly wsLoggerService: WsLoggerService,
    private readonly wsErrorService: WsErrorService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const payload = this.wsAuthService.authenticate(client);
      client.data.userId = payload.id;
      this.wsLoggerService.logConnected(client, payload.id);
    } catch (error) {
      this.wsErrorService.handleConnectionError(client, error);
    }
  }

  handleDisconnect(client: Socket) {
    this.wsLoggerService.logDisconnected(client);
    const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
    rooms.forEach((room) => client.leave(room));
  }

  @SubscribeMessage('project:subscribe')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.join(`project:${projectId}`);
  }

  @SubscribeMessage('project:unsubscribe')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.leave(`project:${projectId}`);
  }

  emitTaskReordered(
    projectId: string,
    updates: { id: string; order: number; status: string }[],
  ) {
    this.server.to(`project:${projectId}`).emit('task:reordered', updates);
  }

  emitTaskCreated(projectId: string, task: any) {
    this.server.to(`project:${projectId}`).emit('task:created', task);
  }
}
