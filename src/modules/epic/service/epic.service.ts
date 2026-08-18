import { Injectable, NotFoundException } from '@nestjs/common';
import { EpicRepository } from '../repository/epic.repository';
import { EpicRequest } from '../request/epic.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'src/redis/serivce/redis.service';
import { RedisKey } from 'src/redis/redis.key';
import { EpicResponse } from '../response/epic.response';

@Injectable()
export class EpicService {
  constructor(
    private readonly epicRepository: EpicRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async create(userId: string, request: EpicRequest): Promise<EpicResponse> {
    const lastNumber = await this.epicRepository.findLastEpicNumber(
      request.workspaceId!,
    );

    const epic = await this.epicRepository.create({
      title: request.title!,
      description: request.description,
      startDate: request.startDate ? new Date(request.startDate) : null,
      dueDate: request.dueDate ? new Date(request.dueDate) : null,
      epicNumber: lastNumber + 1,
      workspace: { connect: { id: request.workspaceId } },
      project: request.projectId
        ? { connect: { id: request.projectId } }
        : undefined,
      user: { connect: { id: userId } },
      milestone: request.milestoneId
        ? { connect: { id: request.milestoneId } }
        : undefined,
    });

    const prefix = epic.project ? `[${epic.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'EPIC_CREATE',
      description: `${prefix}에픽 '${epic.title}'을(를) 생성했습니다.`,
      workspaceId: epic.workspaceId,
      projectId: epic.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('epic.created', {
      workspaceId: epic.workspaceId,
      projectId: epic.projectId,
      epic,
    });

    const response = EpicResponse.fromModel(epic);
    return response;
  }

  async findAllByProjectId(projectId: string): Promise<EpicResponse[]> {
    const epics = await this.epicRepository.findAllByProjectId(projectId);

    return epics.map((epic) => {
      const totalTasks = epic.tasks.length;
      const completedTasks = epic.tasks.filter(
        (t) => t.status === 'DONE',
      ).length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const response = EpicResponse.fromModel(epic);
      response.progress = progress;
      return response;
    });
  }

  async findById(id: string): Promise<EpicResponse> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) throw new NotFoundException('Epic not found');

    const totalTasks = epic.tasks.length;
    const completedTasks = epic.tasks.filter((t) => t.status === 'DONE').length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const response = EpicResponse.fromModel(epic);
    response.progress = progress;
    return response;
  }

  @Transactional()
  async update(
    id: string,
    userId: string,
    request: EpicRequest,
  ): Promise<EpicResponse> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) throw new NotFoundException('Epic not found');

    const updatedEpic = await this.epicRepository.update(id, {
      ...EpicRequest.toModel(request),
    });

    const prefix = updatedEpic.project ? `[${updatedEpic.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'EPIC_UPDATE',
      description: `${prefix}에픽 '${updatedEpic.title}'을(를) 수정했습니다.`,
      workspaceId: updatedEpic.workspaceId,
      projectId: updatedEpic.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('epic.updated', {
      workspaceId: updatedEpic.workspaceId,
      projectId: updatedEpic.projectId,
      epic: updatedEpic,
    });

    const response = EpicResponse.fromModel(updatedEpic);
    return response;
  }

  @Transactional()
  async delete(id: string, userId: string): Promise<EpicResponse> {
    const epic = await this.epicRepository.findById(id);
    if (!epic) throw new NotFoundException('Epic not found');

    const deletedEpic = await this.epicRepository.delete(id);

    const prefix = epic.project ? `[${epic.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'EPIC_DELETE',
      description: `${prefix}에픽 '${epic.title}'을(를) 삭제했습니다.`,
      workspaceId: epic.workspaceId,
      projectId: epic.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('epic.deleted', {
      workspaceId: epic.workspaceId,
      projectId: epic.projectId,
      epicId: id,
    });

    if (epic.projectId) {
      await this.redisService.del(RedisKey.task.projectTasks(epic.projectId));
    }

    return EpicResponse.fromModel(deletedEpic);
  }
}
