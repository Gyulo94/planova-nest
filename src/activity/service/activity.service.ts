import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityRepository } from '../repository/activity.repository';
import { ActivityRequest } from '../request/activity.request';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  private readonly LOGGER = new Logger(ActivityService.name);

  async createActivity(request: ActivityRequest) {
    const throttleActions = ['TASK_UPDATE_DESCRIPTION', 'TASK_UPDATE'];

    if (throttleActions.includes(request.action)) {
      const lastActivity = await this.activityRepository.findLastActivity({
        taskId: request.taskId,
        userId: request.userId,
        action: request.action,
      });

      if (lastActivity) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (new Date(lastActivity.createdAt) > fiveMinutesAgo) {
          return lastActivity;
        }
      }
    }

    const activity = await this.activityRepository.create(request);

    if (activity.projectId) {
      await this.redisService.del(`*activity:project:${activity.projectId}*`);
    }
    if (activity.workspaceId) {
      await this.redisService.del(
        `*activity:workspace:${activity.workspaceId}*`,
      );
    }

    this.eventEmitter.emit('activity.created', activity);
    return activity;
  }

  async findActivities(params: {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, ...filters } = params;

    let cacheKey: string | null = null;
    if (filters.projectId) {
      cacheKey = RedisKey.activity.projectActivities(
        filters.projectId,
        page,
        limit,
      );
    } else if (filters.workspaceId) {
      cacheKey = RedisKey.activity.workspaceActivities(
        filters.workspaceId,
        page,
        limit,
      );
    }

    if (cacheKey) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.LOGGER.debug(`활동 로그 캐시 반환: ${cacheKey}`);
        return JSON.parse(cached);
      }
    }

    const skip = (page - 1) * limit;
    const activities = await this.activityRepository.findActivities({
      ...filters,
      skip,
      take: limit,
    });

    if (cacheKey) {
      await this.redisService.set(cacheKey, JSON.stringify(activities), 60);
    }

    return activities;
  }
}
