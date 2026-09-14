import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityRepository } from '../repository/activity.repository';
import { ActivityRequest } from '../request/activity.request';
import { ActivityResponse } from '../response/activity.response';
import { RedisService } from 'src/redis/serivce/redis.service';
import { RedisKey } from 'src/redis/redis.key';
import { ProjectActivityHistoryRequest } from '../request/project-activity-history.request';
import { ProjectActivityHistoryResponse } from '../response/project-activity-history.response';
import {
  ACTIVITY_CATEGORY_PREFIXES,
  ApiException,
  ErrorCode,
} from 'src/global';
import { WorkspaceActivityHistoryRequest } from '../request/workspace-activity-history.request';
import { WorkspaceActivityHistoryResponse } from '../response/workspace-activity-history.response';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  private readonly LOGGER = new Logger(ActivityService.name);

  async createActivity(request: ActivityRequest): Promise<ActivityResponse> {
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
          return ActivityResponse.fromModel(lastActivity);
        }
      }
    }

    const activity = await this.activityRepository.create(
      ActivityRequest.toModel(request),
    );

    if (activity.projectId) {
      const pattern = `*activity:project:${activity.projectId}*`;
      await this.redisService.del(pattern);
      setTimeout(() => void this.redisService.del(pattern), 500);
    }
    if (activity.workspaceId) {
      const pattern = `*activity:workspace:${activity.workspaceId}*`;
      await this.redisService.del(pattern);
      setTimeout(() => void this.redisService.del(pattern), 500);
    }

    this.eventEmitter.emit('activity.created', activity);

    const response = ActivityResponse.fromModel(activity);

    return response;
  }

  async findActivities(params: {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<ActivityResponse[]> {
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
        return JSON.parse(cached) as ActivityResponse[];
      }
    }

    const skip = (page - 1) * limit;
    const activities = await this.activityRepository.findActivities({
      ...filters,
      skip,
      take: limit,
    });

    const response = activities.map((activity) =>
      ActivityResponse.fromModel(activity),
    );

    if (cacheKey) {
      await this.redisService.set(cacheKey, JSON.stringify(response), 60);
    }

    return response;
  }

  async findProjectActivityHistory(
    projectId: string,
    request: ProjectActivityHistoryRequest,
  ): Promise<ProjectActivityHistoryResponse> {
    const { page = 1, limit = 30, category, userId, from, to } = request;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
    }

    const [activities, total] =
      await this.activityRepository.findProjectActivityHistory({
        projectId,
        userId,
        from: fromDate,
        to: toDate,
        actionPrefixes: category
          ? ACTIVITY_CATEGORY_PREFIXES[category]
          : undefined,
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      items: activities.map((activity) => ActivityResponse.fromModel(activity)),
      page,
      limit,
      total,
      hasNext: page * limit < total,
    };
  }

  async findWorkspaceActivityHistory(
    workspaceId: string,
    request: WorkspaceActivityHistoryRequest,
  ): Promise<WorkspaceActivityHistoryResponse> {
    const {
      page = 1,
      limit = 30,
      category,
      projectId,
      userId,
      from,
      to,
    } = request;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
    }

    const [activities, total] =
      await this.activityRepository.findWorkspaceActivityHistory({
        workspaceId,
        projectId,
        userId,
        from: fromDate,
        to: toDate,
        actionPrefixes: category
          ? ACTIVITY_CATEGORY_PREFIXES[category]
          : undefined,
        skip: (page - 1) * limit,
        take: limit,
      });
    const projectIds = [
      ...new Set(
        activities.flatMap((activity) =>
          activity.projectId ? [activity.projectId] : [],
        ),
      ),
    ];
    const projects =
      await this.activityRepository.findProjectSummariesByIds(projectIds);
    const projectsById = new Map(
      projects.map((project) => [project.id, project]),
    );

    return {
      items: activities.map((activity) => ({
        ...ActivityResponse.fromModel(activity),
        project: activity.projectId
          ? (projectsById.get(activity.projectId) ?? null)
          : null,
      })),
      page,
      limit,
      total,
      hasNext: page * limit < total,
    };
  }
}
