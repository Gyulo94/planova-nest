import { Injectable } from '@nestjs/common';
import { SubtaskRepository } from '../repository/subtask.repository';
import { ActivityService } from 'src/activity/service/activity.service';
import { SubtaskRequest } from '../request/subtask.request';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';
import { SubtaskResponse } from '../response/subtask.response';

@Injectable()
export class SubtaskService {
  constructor(
    private readonly subtaskRepository: SubtaskRepository,
    private readonly activityService: ActivityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  async createSubtask(
    taskId: string,
    title: string,
    userId: string,
  ): Promise<SubtaskResponse> {
    const order = await this.subtaskRepository.getNextOrder(taskId);
    const subtask = await this.subtaskRepository.create({
      taskId,
      title,
      order,
    });

    await this.activityService.createActivity({
      action: 'SUBTASK_CREATE',
      description: `${subtask.task.project.name} 작업 '${subtask.task.title}'에 하위 작업 '${title}'을(를) 추가했습니다.`,
      workspaceId: subtask.task.project.workspaceId,
      projectId: subtask.task.projectId,
      taskId: subtask.taskId,
      userId,
    });

    const updatedTask = await this.subtaskRepository.updateTaskProgress(taskId);

    await this.redisService.del(
      RedisKey.task.projectTasks(updatedTask.projectId),
    );

    this.eventEmitter.emit('task.updated', {
      workspaceId: updatedTask.project.workspaceId,
      projectId: updatedTask.projectId,
      task: updatedTask,
    });

    const response = SubtaskResponse.fromModel(subtask);

    return response;
  }

  async updateSubtask(
    id: string,
    request: SubtaskRequest,
    userId: string,
  ): Promise<SubtaskResponse> {
    const { title, completed } = request;

    const isExistingSubtask = await this.subtaskRepository.findById(id);
    if (!isExistingSubtask) throw new ApiException(ErrorCode.SUBTASK_NOT_FOUND);

    const subtask = await this.subtaskRepository.update(
      id,
      SubtaskRequest.toModel(request),
    );

    if (completed !== undefined && isExistingSubtask.completed !== completed) {
      await this.activityService.createActivity({
        action: 'SUBTASK_STATUS_UPDATE',
        description: `${subtask.task.project.name} 작업 '${subtask.task.title}'에 하위 작업 '${title}'을(를) ${completed ? '완료' : '미완료'} 상태로 변경했습니다.`,
        workspaceId: subtask.task.project.workspaceId,
        projectId: subtask.task.projectId,
        taskId: subtask.taskId,
        userId,
      });
    } else if (title && isExistingSubtask.title !== title) {
      await this.activityService.createActivity({
        action: 'SUBTASK_UPDATE',
        description: `${subtask.task.project.name} 작업 '${subtask.task.title}'에 하위 작업 제목을 '${isExistingSubtask.title}'에서 '${title}'(으)로 변경했습니다.`,
        workspaceId: subtask.task.project.workspaceId,
        projectId: subtask.task.projectId,
        taskId: subtask.taskId,
        userId,
      });
    }

    const updatedTask = await this.subtaskRepository.updateTaskProgress(
      subtask.taskId,
    );

    await this.redisService.del(
      RedisKey.task.projectTasks(updatedTask.projectId),
    );

    this.eventEmitter.emit('task.updated', {
      workspaceId: updatedTask.project.workspaceId,
      projectId: updatedTask.projectId,
      task: updatedTask,
    });

    const response = SubtaskResponse.fromModel(subtask);

    return response;
  }

  async deleteSubtask(id: string, userId: string): Promise<SubtaskResponse> {
    const subtask = await this.subtaskRepository.findById(id);
    if (!subtask) throw new ApiException(ErrorCode.SUBTASK_NOT_FOUND);

    await this.subtaskRepository.delete(id);

    await this.activityService.createActivity({
      action: 'SUBTASK_DELETE',
      description: `${subtask.task.project.name} 작업 '${subtask.task.title}'에 하위 작업 '${subtask.title}'을(를) 삭제했습니다.`,
      workspaceId: subtask.task.project.workspaceId,
      projectId: subtask.task.projectId,
      taskId: subtask.taskId,
      userId,
    });

    const updatedTask = await this.subtaskRepository.updateTaskProgress(
      subtask.taskId,
    );

    await this.redisService.del(
      RedisKey.task.projectTasks(updatedTask.projectId),
    );

    this.eventEmitter.emit('task.updated', {
      workspaceId: updatedTask.project.workspaceId,
      projectId: updatedTask.projectId,
      task: updatedTask,
    });

    const response = SubtaskResponse.fromModel(subtask);

    return response;
  }

  async findByTaskId(taskId: string): Promise<SubtaskResponse[]> {
    const subtasks = await this.subtaskRepository.findByTaskId(taskId);
    const response = subtasks.map((subtask) =>
      SubtaskResponse.fromModel(subtask),
    );

    return response;
  }
}
