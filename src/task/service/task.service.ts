import { Injectable, Logger } from '@nestjs/common';
import { TaskRepository } from '../repository/task.repository';
import { TaskRequest } from '../request/task.request';
import { LabelService } from 'src/label/service/label.service';
import { ReorderTaskRequest } from '../request/reorder-task.request';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { TaskGateway } from '../gateway/task.gateway';
import { ProjectMemberService } from 'src/project-member/service/project-member.service';
import { RedisKey } from 'src/global/redis/redis.key';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { ImageService } from 'src/image/service/image.service';
import { UpdateDescriptionRequest } from '../request/update-description.request';
import { ActivityService } from 'src/activity/service/activity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';

function extractImageSrcUrls(html: string): string[] {
  const srcRegex = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  const urls = new Set<string>();
  let match: RegExpExecArray | null = srcRegex.exec(html);

  while (match) {
    if (match[1]) {
      urls.add(match[1]);
    }
    match = srcRegex.exec(html);
  }

  return [...urls];
}

function isSameUrlSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  if (aSet.size !== b.length) return false;
  return b.every((url) => aSet.has(url));
}

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly labelService: LabelService,
    private readonly projectMemberService: ProjectMemberService,
    private readonly taskGateway: TaskGateway,
    private readonly redisService: RedisService,
    private readonly imageService: ImageService,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  private readonly LOGGER = new Logger(TaskService.name);

  async createTask(request: TaskRequest, userId: string) {
    const taskNumber = await this.taskRepository.getNextTaskNumber(
      request.projectId,
    );
    const data = TaskRequest.toModel(request, taskNumber);
    const resolvedLabelId =
      request.labelId ||
      (await this.labelService.resolveLabelId(
        request.projectId,
        request.labelName,
      ));

    const task = await this.taskRepository.create(
      data,
      request.assigneeId,
      resolvedLabelId,
    );

    await this.redisService.del(RedisKey.task.projectTasks(request.projectId));
    this.taskGateway.emitTaskCreated(request.projectId, task);

    await this.activityService.createActivity({
      action: 'TASK_CREATE',
      description: `[${task.project.name}] 작업 '${task.title}'을(를) 생성했습니다.`,
      workspaceId: task.project.workspaceId,
      projectId: task.projectId,
      taskId: task.id,
      userId,
    });

    this.eventEmitter.emit('task.created', {
      workspaceId: task.project.workspaceId,
      projectId: task.projectId,
      task,
    });

    return task;
  }

  async findTaskByTaskId(id: string) {
    return this.taskRepository.getById(id);
  }

  async findTasksByProjectId(projectId: string, userId: string) {
    await this.projectMemberService.validateProjectMember(projectId, userId);

    const cacheKey = RedisKey.task.projectTasks(projectId);
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.LOGGER.debug('캐시에서 작업 목록 반환: projectId=${projectId}');
      return JSON.parse(cached);
    }

    const tasks = await this.taskRepository.findTasksByProjectId(projectId);
    await this.redisService.set(cacheKey, JSON.stringify(tasks), 30);

    return tasks;
  }

  @Transactional()
  async reorderTasks(request: ReorderTaskRequest, userId: string) {
    const ids = request.updates.map((u) => u.id);
    const existingTasks = await this.taskRepository.findByIds(ids);

    const result = await this.taskRepository.reorder(request.updates);
    await this.redisService.del(RedisKey.task.projectTasks(request.projectId));

    const statusMap: Record<string, string> = {
      BACKLOG: '백로그',
      TODO: '할 일',
      IN_PROGRESS: '진행 중',
      REVIEW: '검토 중',
      DONE: '완료',
    };

    let statusChanged = false;

    for (const update of request.updates) {
      const oldTask = existingTasks.find((t) => t.id === update.id);
      if (oldTask && oldTask.status !== update.status) {
        if (oldTask.status === 'DONE') {
          throw new ApiException(ErrorCode.INVALID_TASK_STATUS);
        }
        statusChanged = true;
        await this.activityService.createActivity({
          action: 'TASK_STATUS_UPDATE',
          description: `[${oldTask.project.name}] 작업 '${oldTask.title}'의 상태를 '${statusMap[oldTask.status] || oldTask.status}'에서 '${statusMap[update.status] || update.status}'(으)로 변경했습니다.`,
          workspaceId: oldTask.project.workspaceId,
          projectId: request.projectId,
          taskId: update.id,
          userId,
        });
      }
    }

    if (!statusChanged) {
      await this.activityService.createActivity({
        action: 'TASK_REORDER',
        description: `작업 순서를 변경했습니다.`,
        projectId: request.projectId,
        userId,
      });
    }

    await this.taskGateway.emitTaskReordered(
      request.projectId,
      request.updates,
    );

    this.eventEmitter.emit('task.reordered', {
      workspaceId: existingTasks[0].project.workspaceId,
      projectId: request.projectId,
    });

    return result;
  }

  async updateDescription(
    id: string,
    request: UpdateDescriptionRequest,
    userId: string,
  ): Promise<string> {
    const { description = '', tempImageUrls = [] } = request;

    let finalDescription = description;

    let persistedImageUrls = await this.imageService.findImageUrlsByModelId(
      id,
      'task',
    );

    if (tempImageUrls.length > 0) {
      const imageResponses = await this.imageService.createImages({
        id,
        urls: tempImageUrls,
        existingImages: [],
        entity: 'task',
      });

      imageResponses.forEach((img, index) => {
        if (tempImageUrls[index]) {
          finalDescription = finalDescription.replaceAll(
            tempImageUrls[index],
            img.url,
          );
        }
      });

      persistedImageUrls = await this.imageService.findImageUrlsByModelId(
        id,
        'task',
      );
    }

    const imageUrlsInDescription = extractImageSrcUrls(finalDescription);
    const persistedImageSet = new Set(persistedImageUrls);
    const targetImageUrls = imageUrlsInDescription.filter((url) =>
      persistedImageSet.has(url),
    );

    if (!isSameUrlSet(persistedImageUrls, targetImageUrls)) {
      if (targetImageUrls.length === 0 && persistedImageUrls.length > 0) {
        await this.imageService.deleteImages([id], 'task');
      } else {
        await this.imageService.updateImages({
          id,
          urls: targetImageUrls,
          existingImages: persistedImageUrls,
          entity: 'task',
        });
      }
    }

    await this.taskRepository.updateDescription(id, finalDescription);

    const task = await this.taskRepository.getById(id);
    if (task) {
      await this.redisService.del(RedisKey.task.projectTasks(task.projectId));
      await this.activityService.createActivity({
        action: 'TASK_UPDATE_DESCRIPTION',
        description: `[${task.project.name}] 작업 '${task.title}'의 설명을 수정했습니다.`,
        workspaceId: task.project.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        userId,
      });
    }

    return finalDescription;
  }

  @Transactional()
  async updateTask(id: string, request: TaskRequest, userId: string) {
    const existingTask = await this.taskRepository.getById(id);
    if (!existingTask) throw new ApiException(ErrorCode.TASK_NOT_FOUND);

    if (existingTask.status === 'DONE' && request.status !== 'DONE') {
      throw new ApiException(ErrorCode.INVALID_TASK_STATUS);
    }

    const {
      assigneeId,
      labelId,
      labelName,
      epicId,
      milestoneId,
      projectId,
      ...rest
    } = request;

    const data: any = {
      ...rest,
      startDate: request.startDate ? new Date(request.startDate) : undefined,
      dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
      epic:
        epicId === undefined
          ? undefined
          : epicId
            ? { connect: { id: epicId } }
            : { disconnect: true },
      milestone:
        milestoneId === undefined
          ? undefined
          : milestoneId
            ? { connect: { id: milestoneId } }
            : { disconnect: true },
    };

    if (assigneeId) {
      data.taskAssignee = {
        deleteMany: {},
        create: { userId: assigneeId },
      };
    }

    if (labelId || labelName) {
      const resolvedLabelId =
        labelId ||
        (await this.labelService.resolveLabelId(
          existingTask.projectId,
          labelName,
        ));

      data.taskLabel = {
        deleteMany: {},
        create: { labelId: resolvedLabelId },
      };
    }

    const updatedTask = await this.taskRepository.update(id, data);

    await this.redisService.del(
      RedisKey.task.projectTasks(existingTask.projectId),
    );
    this.taskGateway.emitTaskUpdated(existingTask.projectId, updatedTask);

    await this.activityService.createActivity({
      action: 'TASK_UPDATE',
      description: `[${updatedTask.project.name}] 작업 '${updatedTask.title}'을(를) 수정했습니다.`,
      workspaceId: updatedTask.project.workspaceId,
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
      userId,
    });

    this.eventEmitter.emit('task.updated', {
      workspaceId: updatedTask.project.workspaceId,
      projectId: updatedTask.projectId,
      task: updatedTask,
    });

    return updatedTask;
  }

  @Transactional()
  async deleteTask(id: string, userId: string) {
    const existingTask = await this.taskRepository.getById(id);
    if (!existingTask) throw new ApiException(ErrorCode.TASK_NOT_FOUND);

    const deletedTask = await this.taskRepository.delete(id);

    await this.redisService.del(
      RedisKey.task.projectTasks(existingTask.projectId),
    );
    this.taskGateway.emitTaskDeleted(existingTask.projectId, id);

    await this.activityService.createActivity({
      action: 'TASK_DELETE',
      description: `[${existingTask.project.name}] 작업 '${existingTask.title}'을(를) 삭제했습니다.`,
      workspaceId: existingTask.project.workspaceId,
      projectId: existingTask.projectId,
      taskId: existingTask.id,
      userId,
    });

    this.eventEmitter.emit('task.deleted', {
      workspaceId: existingTask.project.workspaceId,
      projectId: existingTask.projectId,
      taskId: id,
    });

    return deletedTask;
  }

  @Transactional()
  async approveTask(id: string, userId: string) {
    const task = await this.taskRepository.getById(id);
    if (!task) throw new ApiException(ErrorCode.TASK_NOT_FOUND);

    if (task.status !== 'REVIEW') {
      throw new ApiException(ErrorCode.INVALID_TASK_STATUS);
    }

    await this.projectMemberService.validateProjectOwner(
      task.projectId,
      userId,
    );

    const existingApprovals =
      await this.taskRepository.findApprovalsByTaskId(id);
    if (existingApprovals.some((a) => a.userId === userId)) {
      throw new ApiException(ErrorCode.INVALID_TASK_STATUS);
    }

    await this.taskRepository.createApproval(id, userId);

    const updatedApprovals =
      await this.taskRepository.findApprovalsByTaskId(id);

    let finalTask = task;
    if (updatedApprovals.length >= task.requiredApprovals) {
      finalTask = await this.taskRepository.update(id, {
        status: 'DONE',
        completedAt: new Date(),
        progress: 100,
      });

      await this.redisService.del(RedisKey.task.projectTasks(task.projectId));

      await this.activityService.createActivity({
        action: 'TASK_APPROVED',
        description: `[${task.project.name}] 작업 '${task.title}'이(가) 승인되어 완료되었습니다.`,
        workspaceId: task.project.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        userId,
      });
    } else {
      await this.activityService.createActivity({
        action: 'TASK_APPROVE_ADDED',
        description: `[${task.project.name}] 작업 '${task.title}'을(를) 승인했습니다. (${updatedApprovals.length}/${task.requiredApprovals})`,
        workspaceId: task.project.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        userId,
      });
      // 승인 목록을 포함한 상태로 반환하기 위해 task 객체 보완
      finalTask = { ...task, approval: updatedApprovals } as any;
    }

    this.eventEmitter.emit('task.updated', {
      workspaceId: task.project.workspaceId,
      projectId: task.projectId,
      task: finalTask,
    });

    return finalTask;
  }
}
