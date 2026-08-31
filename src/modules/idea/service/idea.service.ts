import { Injectable, NotFoundException } from '@nestjs/common';
import { IdeaRepository } from '../repository/idea.repository';
import { IdeaRequest } from '../request/idea.request';
import { ReorderIdeaRequest } from '../request/reorder-idea.request';
import { IdeaResponse } from '../response/idea.response';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ActivityService } from 'src/modules/activity/service/activity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'src/redis/serivce/redis.service';
import { RedisKey } from 'src/redis/redis.key';

@Injectable()
export class IdeaService {
  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  @Transactional()
  async create(userId: string, request: IdeaRequest): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.create(
      IdeaRequest.toModel(request, userId),
    );

    const prefix = idea.project ? `[${idea.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'IDEA_CREATE',
      description: `${prefix}아이디어 '${idea.title}'을(를) 등록했습니다.`,
      workspaceId: idea.workspaceId,
      projectId: idea.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('idea.created', {
      workspaceId: idea.workspaceId,
      projectId: idea.projectId,
      idea,
    });

    if (idea.projectId) {
      const cacheKey = RedisKey.idea.projectIdeas(idea.projectId);
      await this.redisService.del(cacheKey);
    }

    return IdeaResponse.fromModel(idea);
  }

  async findAllByProjectId(projectId: string): Promise<IdeaResponse[]> {
    const cacheKey = RedisKey.idea.projectIdeas(projectId);
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.map((item: any) => IdeaResponse.fromModel(item));
    }

    const ideas = await this.ideaRepository.findAllByProjectId(projectId);
    const response = ideas.map((idea) => IdeaResponse.fromModel(idea));

    await this.redisService.set(cacheKey, JSON.stringify(response), 30);

    return response;
  }

  async findById(id: string): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.findById(id);
    if (!idea) throw new NotFoundException('Idea not found');
    return IdeaResponse.fromModel(idea);
  }

  @Transactional()
  async update(
    id: string,
    userId: string,
    request: IdeaRequest,
  ): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.findById(id);
    if (!idea) throw new NotFoundException('Idea not found');

    const updatedIdea = await this.ideaRepository.update(id, {
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      color: request.color,
      label: request.labelId
        ? { connect: { id: request.labelId } }
        : { disconnect: true },
      task: request.promotedToTaskId
        ? { connect: { id: request.promotedToTaskId } }
        : undefined,
    });

    const prefix = updatedIdea.project ? `[${updatedIdea.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'IDEA_UPDATE',
      description: `${prefix}아이디어 '${updatedIdea.title}'을(를) 수정했습니다.`,
      workspaceId: updatedIdea.workspaceId,
      projectId: updatedIdea.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('idea.updated', {
      workspaceId: updatedIdea.workspaceId,
      projectId: updatedIdea.projectId,
      idea: updatedIdea,
    });

    if (updatedIdea.projectId) {
      const cacheKey = RedisKey.idea.projectIdeas(updatedIdea.projectId);
      await this.redisService.del(cacheKey);
    }

    return IdeaResponse.fromModel(updatedIdea);
  }

  @Transactional()
  async delete(id: string, userId: string): Promise<IdeaResponse> {
    const idea = await this.ideaRepository.findById(id);
    if (!idea) throw new NotFoundException('Idea not found');

    const deletedIdea = await this.ideaRepository.delete(id);

    const prefix = idea.project ? `[${idea.project.name}] ` : '';

    await this.activityService.createActivity({
      action: 'IDEA_DELETE',
      description: `${prefix}아이디어 '${idea.title}'을(를) 삭제했습니다.`,
      workspaceId: idea.workspaceId,
      projectId: idea.projectId ?? undefined,
      userId,
    });

    await this.eventEmitter.emitAsync('idea.deleted', {
      workspaceId: idea.workspaceId,
      projectId: idea.projectId,
      ideaId: id,
    });

    if (idea.projectId) {
      const cacheKey = RedisKey.idea.projectIdeas(idea.projectId);
      await this.redisService.del(cacheKey);
    }

    return IdeaResponse.fromModel(deletedIdea);
  }

  @Transactional()
  async reorder(request: ReorderIdeaRequest, userId: string) {
    const result = await this.ideaRepository.reorder(request.updates);

    await this.activityService.createActivity({
      action: 'IDEA_REORDER',
      description: `아이디어 순서를 변경했습니다.`,
      workspaceId: result[0]?.workspaceId,
      projectId: request.projectId,
      userId,
    });

    await this.eventEmitter.emitAsync('idea.reordered', {
      projectId: request.projectId,
      updates: request.updates,
    });

    const cacheKey = RedisKey.idea.projectIdeas(request.projectId);
    await this.redisService.del(cacheKey);

    return result;
  }
}
