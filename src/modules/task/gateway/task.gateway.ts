import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from 'src/global/ws/ws-auth.service';
import { WsLoggerService } from 'src/global/ws/ws-logger.service';
import { WsErrorService } from 'src/global/ws/ws-error.service';
import { CLIENT_URL } from 'src/global/constants';
import type {
  Activity,
  Epic,
  Label,
  Milestone,
  ProjectMember,
  Task,
} from '@prisma/client';
import { EpicService } from 'src/modules/epic/service/epic.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [CLIENT_URL],
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly LOGGER = new Logger(TaskGateway.name);
  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly wsLoggerService: WsLoggerService,
    private readonly wsErrorService: WsErrorService,
    private readonly epicService: EpicService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const session = await this.wsAuthService.authenticate(client);
      this.LOGGER.debug(`[WS Connected] User ID: ${session.user.id}`);
    } catch (error) {
      client.disconnect(true);
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

  emitTaskCreated(projectId: string, task: Task) {
    this.server.to(`project:${projectId}`).emit('task:created', task);
  }

  emitActivityCreated(projectId: string, activity: Activity) {
    this.server.to(`project:${projectId}`).emit('activity:created', activity);
  }

  emitTaskUpdated(projectId: string, task: Task) {
    this.server.to(`project:${projectId}`).emit('task:updated', task);
  }

  emitTaskDeleted(projectId: string, taskId: string) {
    this.server.to(`project:${projectId}`).emit('task:deleted', taskId);
  }

  @OnEvent('activity.created')
  handleActivityCreated(activity: Activity) {
    if (activity.projectId) {
      this.emitActivityCreated(activity.projectId, activity);
    }
  }

  @OnEvent('project.member.invited')
  handleProjectMemberInvited(payload: {
    projectId: string;
    members: ProjectMember[];
  }) {
    this.server
      .to(`project:${payload.projectId}`)
      .emit('project:member_invited', payload.members);
  }

  @OnEvent('project.member.removed')
  handleProjectMemberRemoved(payload: { projectId: string; memberId: string }) {
    this.server
      .to(`project:${payload.projectId}`)
      .emit('project:member_removed', payload.memberId);
  }

  @OnEvent('task.created')
  handleTaskCreated(payload: { projectId: string; task: Task }) {
    this.emitTaskCreated(payload.projectId, payload.task as Task);
  }

  @OnEvent('task.updated')
  handleTaskUpdated(payload: { projectId: string; task: Task }) {
    this.emitTaskUpdated(payload.projectId, payload.task as Task);
  }

  @OnEvent('task.deleted')
  handleTaskDeleted(payload: { projectId: string; taskId: string }) {
    this.emitTaskDeleted(payload.projectId, payload.taskId!);
  }

  @OnEvent('milestone.created')
  handleMilestoneCreated(payload: { projectId: string; milestone: Milestone }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('milestone:created', payload.milestone);
    }
  }

  @OnEvent('milestone.updated')
  handleMilestoneUpdated(payload: { projectId: string; milestone: Milestone }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('milestone:updated', payload.milestone);
    }
  }

  @OnEvent('milestone.deleted')
  handleMilestoneDeleted(payload: { projectId: string; milestoneId: string }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('milestone:deleted', payload.milestoneId);
    }
  }

  @OnEvent('epic.created')
  handleEpicCreated(payload: { projectId: string; epic: Epic }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('epic:created', payload.epic);
    }
  }

  @OnEvent('epic.updated')
  handleEpicUpdated(payload: { projectId: string; epic: Epic }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('epic:updated', payload.epic);
    }
  }

  @OnEvent('epic.deleted')
  handleEpicDeleted(payload: { projectId: string; epicId: string }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('epic:deleted', payload.epicId);
    }
  }

  @OnEvent('label.created')
  handleLabelCreated(payload: { projectId: string; label: Label }) {
    if (payload.projectId) {
      this.server
        .to(`project:${payload.projectId}`)
        .emit('label:created', payload.label);
    }
  }

  @OnEvent(['task.created', 'task.updated', 'task.deleted', 'task.reordered'])
  async handleTaskEventForEpics(payload: { projectId: string }) {
    const { projectId } = payload;
    if (!projectId) return;

    const epics = await this.epicService.findAllByProjectId(projectId);
    for (const epic of epics) {
      this.server.to(`project:${projectId}`).emit('epic:updated', epic);
    }
  }
}
