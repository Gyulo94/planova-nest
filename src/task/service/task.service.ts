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

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly labelService: LabelService,
    private readonly projectMemberService: ProjectMemberService,
    private readonly taskGateway: TaskGateway,
    private readonly redisService: RedisService,
  ) {}
  private readonly LOGGER = new Logger(TaskService.name);

  async createTask(request: TaskRequest) {
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
    return task;
  }

  async findTaskByTaskId(taskId: string) {
    return this.taskRepository.getById(taskId);
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
  async reorderTasks(request: ReorderTaskRequest) {
    const result = await this.taskRepository.reorder(request.updates);
    await this.redisService.del(RedisKey.task.projectTasks(request.projectId));
    return result;
  }
}
