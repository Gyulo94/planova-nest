import { Body, Controller, Post, Get, Param, Put } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { TaskRequest } from '../request/task.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { Payload } from 'src/global/types';
import { ReorderTaskRequest } from '../request/reorder-task.request';
import { TaskGateway } from '../gateway/task.gateway';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskGateway: TaskGateway,
  ) {}

  @Message(ResponseMessage.CREATE_TASK_SUCCESS)
  @Post('create')
  async createTask(
    @Body() request: TaskRequest,
    @CurrentUser() _user: Payload,
  ) {
    const response = await this.taskService.createTask(request);
    return response;
  }

  @Get('project/:projectId')
  async findTasksByProjectId(
    @Param('projectId') projectId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.taskService.findTasksByProjectId(
      projectId,
      user.id,
    );
    return response;
  }

  @Get(':taskId')
  async findTaskByTaskId(@Param('taskId') taskId: string) {
    const response = await this.taskService.findTaskByTaskId(taskId);
    return response;
  }

  @Put('reorder')
  async reorderTasks(@Body() request: ReorderTaskRequest) {
    const response = await this.taskService.reorderTasks(request);
    this.taskGateway.emitTaskReordered(request.projectId, request.updates);
    return response;
  }
}
