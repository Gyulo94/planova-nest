import { Injectable, NotFoundException } from '@nestjs/common';
import { EpicRepository } from '../repository/epic.repository';
import { CreateEpicRequest, UpdateEpicRequest } from '../request/epic.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ActivityService } from 'src/activity/service/activity.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';

@Injectable()
export class EpicService {
  constructor(
    private readonly epicRepository: EpicRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async create(userId: string, request: CreateEpicRequest) {
    const lastNumber = await this.epicRepository.findLastEpicNumber(
      request.workspaceId,
    );

    const epic = await this.epicRepository.create({
      title: request.title,
      description: request.description,
      startDate: request.startDate ? new Date(request.startDate) : null,
      dueDate: request.dueDate ? new Date(request.dueDate) : null,
      epicNumber: lastNumber + 1,
      workspace: { connect: { id: request.workspaceId } },
      project: request.projectId
        ? { connect: { id: request.projectId } }
        : undefined,
      user: { connect: { id: userId } },
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

    return epic;
  }

  async findAllByProjectId(projectId: string) {
    const epics = await this.epicRepository.findAllByProjectId(projectId);

    // 진행률 계산 로직 추가
    return epics.map((epic) => {
      const totalTasks = epic.task.length;
      const completedTasks = epic.task.filter(
        (t) => t.status === 'DONE',
      ).length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...epic,
        progress,
        completedTasks,
        taskCount: totalTasks,
      };
    });
  }

  async findById(id: string) {
    const epic = await this.epicRepository.findById(id);
    if (!epic) throw new NotFoundException('Epic not found');

    const totalTasks = epic.task.length;
    const completedTasks = epic.task.filter((t) => t.status === 'DONE').length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...epic,
      progress,
      completedTasks,
      taskCount: totalTasks,
    };
  }

  @Transactional()
  async update(id: string, userId: string, request: UpdateEpicRequest) {
    const epic = await this.epicRepository.findById(id);
    if (!epic) throw new NotFoundException('Epic not found');

    const updatedEpic = await this.epicRepository.update(id, {
      title: request.title,
      description: request.description,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
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

    return updatedEpic;
  }

  @Transactional()
  async delete(id: string, userId: string) {
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

    return deletedEpic;
  }

  @OnEvent(['task.created', 'task.updated', 'task.deleted', 'task.reordered'])
  async handleTaskEvent(payload: any) {
    const { projectId } = payload;
    if (!projectId) return;

    try {
      // 해당 프로젝트의 모든 에픽을 가져와서 각각 업데이트 이벤트 발행
      const epics = await this.findAllByProjectId(projectId);
      for (const epic of epics) {
        await this.eventEmitter.emitAsync('epic.updated', {
          workspaceId: epic.workspaceId,
          projectId: epic.projectId,
          epic,
        });
      }
    } catch (error) {
      // 에러 발생 시 로그를 남기거나 무시 (실시간 업데이트 실패가 전체 로직을 멈추지 않게 함)
    }
  }
}
