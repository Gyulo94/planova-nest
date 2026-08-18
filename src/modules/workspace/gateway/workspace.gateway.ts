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
import type { Activity, Project, WorkspaceMember } from '@prisma/client';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [CLIENT_URL],
    credentials: true,
  },
})
export class WorkspaceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly LOGGER = new Logger(WorkspaceGateway.name);
  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly wsLoggerService: WsLoggerService,
    private readonly wsErrorService: WsErrorService,
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
  }

  @SubscribeMessage('workspace:subscribe')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() workspaceId: string,
  ) {
    client.join(`workspace:${workspaceId}`);
  }

  @SubscribeMessage('workspace:unsubscribe')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() workspaceId: string,
  ) {
    client.leave(`workspace:${workspaceId}`);
  }

  @OnEvent('workspace.member.joined')
  handleMemberJoined(payload: {
    workspaceId: string;
    member: WorkspaceMember;
  }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:member_joined', payload.member);
  }

  @OnEvent('workspace.member.removed')
  handleMemberRemoved(payload: { workspaceId: string; memberId: string }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:member_removed', payload.memberId);
  }

  @OnEvent('project.created')
  handleProjectCreated(payload: { workspaceId: string; project: Project }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('project:created', payload.project);
  }

  @OnEvent('activity.created')
  handleActivityCreated(activity: Activity) {
    if (activity.workspaceId) {
      this.server
        .to(`workspace:${activity.workspaceId}`)
        .emit('activity:created', activity);
    }
  }

  @OnEvent('task.created')
  handleTaskCreated(payload: { workspaceId: string; task: any }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:task_updated', payload.task);
  }

  @OnEvent('task.updated')
  handleTaskUpdated(payload: { workspaceId: string; task: any }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:task_updated', payload.task);
  }

  @OnEvent('task.deleted')
  handleTaskDeleted(payload: { workspaceId: string; taskId: string }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:task_updated', { id: payload.taskId });
  }

  @OnEvent('task.reordered')
  handleTaskReordered(payload: { workspaceId: string; projectId: string }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:task_updated', { projectId: payload.projectId });
  }

  @OnEvent('project.member.invited')
  handleProjectMemberInvited(payload: {
    workspaceId: string;
    projectId: string;
    members: any[];
  }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('project:member_invited', payload);
  }

  @OnEvent('project.member.removed')
  handleProjectMemberRemoved(payload: {
    workspaceId: string;
    projectId: string;
    memberId: string;
  }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('project:member_removed', payload);
  }

  @OnEvent('milestone.created')
  @OnEvent('milestone.updated')
  @OnEvent('milestone.deleted')
  handleMilestoneUpdated(payload: { workspaceId: string }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:milestone_updated', payload);
  }

  @OnEvent('epic.created')
  @OnEvent('epic.updated')
  @OnEvent('epic.deleted')
  handleEpicUpdated(payload: { workspaceId: string }) {
    this.server
      .to(`workspace:${payload.workspaceId}`)
      .emit('workspace:epic_updated', payload);
  }

  @OnEvent('user.updated')
  handleUserUpdated(user: any) {
    this.server.emit('user:updated', user);
  }
}
