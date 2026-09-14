import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { ApiException, ErrorCode, Transactional } from 'src/global';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { CreateTroubleshootingRequest } from '../request/create-troubleshooting.request';
import { UpdateTroubleshootingRequest } from '../request/update-troubleshooting.request';
import { TroubleshootingRepository } from '../repository/troubleshooting.repository';
import { TroubleshootingResponse } from '../response/troubleshooting.response';

@Injectable()
export class TroubleshootingService {
  constructor(
    private readonly repository: TroubleshootingRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private ensureContent(value: string | undefined, label: string) {
    if (value === undefined) return;
    const plainText = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .trim();
    if (!plainText)
      throw new ApiException(
        ErrorCode.BAD_REQUEST,
        `${label}을(를) 입력해주세요.`,
      );
  }

  private async findInProject(id: string, projectId: string) {
    const item = await this.repository.findById(id);
    if (!item || item.projectId !== projectId) {
      throw new ApiException(ErrorCode.TROUBLESHOOTING_NOT_FOUND);
    }
    return item;
  }

  private async findTaskInProject(taskId: string, projectId: string) {
    const task = await this.repository.findTaskById(taskId);
    if (!task || task.projectId !== projectId) {
      throw new ApiException(ErrorCode.INVALID_TASK_IN_PROJECT);
    }
    return task;
  }

  @Transactional()
  async create(
    projectId: string,
    userId: string,
    request: CreateTroubleshootingRequest,
  ): Promise<TroubleshootingResponse> {
    this.ensureContent(request.title, '제목');
    this.ensureContent(request.problem, '발생 문제');
    this.ensureContent(request.solution, '해결 방법');
    const task = await this.findTaskInProject(request.taskId, projectId);

    const item = await this.repository.create({
      title: request.title.trim(),
      problem: request.problem,
      solution: request.solution,
      project: { connect: { id: projectId } },
      task: { connect: { id: task.id } },
      taskNumberSnapshot: task.taskNumber,
      taskTitleSnapshot: task.title,
    });

    await this.activityService.createActivity({
      action: 'TROUBLESHOOTING_CREATE',
      description: `[${item.project.name}] 트러블슈팅 '${item.title}'을(를) 등록했습니다.`,
      workspaceId: item.project.workspaceId,
      projectId,
      taskId: task.id,
      userId,
    });
    this.eventEmitter.emit('troubleshooting.created', { projectId, item });
    return TroubleshootingResponse.fromModel(item);
  }

  async findAllByProjectId(
    projectId: string,
  ): Promise<TroubleshootingResponse[]> {
    const items = await this.repository.findAllByProjectId(projectId);
    return items.map((item) => TroubleshootingResponse.fromModel(item));
  }

  async findById(
    id: string,
    projectId: string,
  ): Promise<TroubleshootingResponse> {
    return TroubleshootingResponse.fromModel(
      await this.findInProject(id, projectId),
    );
  }

  @Transactional()
  async update(
    id: string,
    projectId: string,
    userId: string,
    request: UpdateTroubleshootingRequest,
  ): Promise<TroubleshootingResponse> {
    await this.findInProject(id, projectId);
    this.ensureContent(request.title, '제목');
    this.ensureContent(request.problem, '발생 문제');
    this.ensureContent(request.solution, '해결 방법');

    const data: Prisma.TroubleshootingUpdateInput = {
      title: request.title?.trim(),
      problem: request.problem,
      solution: request.solution,
    };
    if (request.taskId !== undefined) {
      const task = await this.findTaskInProject(request.taskId, projectId);
      data.task = { connect: { id: task.id } };
      data.taskNumberSnapshot = task.taskNumber;
      data.taskTitleSnapshot = task.title;
    }

    const item = await this.repository.update(id, data);
    await this.activityService.createActivity({
      action: 'TROUBLESHOOTING_UPDATE',
      description: `[${item.project.name}] 트러블슈팅 '${item.title}'을(를) 수정했습니다.`,
      workspaceId: item.project.workspaceId,
      projectId,
      taskId: item.taskId ?? undefined,
      userId,
    });
    this.eventEmitter.emit('troubleshooting.updated', { projectId, item });
    return TroubleshootingResponse.fromModel(item);
  }

  @Transactional()
  async delete(id: string, projectId: string, userId: string): Promise<void> {
    const existing = await this.findInProject(id, projectId);
    await this.repository.delete(id);
    await this.activityService.createActivity({
      action: 'TROUBLESHOOTING_DELETE',
      description: `[${existing.project.name}] 트러블슈팅 '${existing.title}'을(를) 삭제했습니다.`,
      workspaceId: existing.project.workspaceId,
      projectId,
      taskId: existing.taskId ?? undefined,
      userId,
    });
    this.eventEmitter.emit('troubleshooting.deleted', { projectId, id });
  }
}
