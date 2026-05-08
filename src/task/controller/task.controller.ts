import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { TaskRequest } from '../request/task.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { Payload } from 'src/global/types';
import { ReorderTaskRequest } from '../request/reorder-task.request';
import { TaskGateway } from '../gateway/task.gateway';
import { UpdateDescriptionRequest } from '../request/update-description.request';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskGateway: TaskGateway,
  ) {}

  @Message(ResponseMessage.CREATE_TASK_SUCCESS)
  @Post('create')
  async createTask(@Body() request: TaskRequest, @CurrentUser() user: Payload) {
    const response = await this.taskService.createTask(request, user.id);
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

  @Get(':id')
  async findTaskByTaskId(@Param('id') taskId: string) {
    const response = await this.taskService.findTaskByTaskId(taskId);
    return response;
  }

  @Put('reorder')
  async reorderTasks(
    @Body() request: ReorderTaskRequest,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.taskService.reorderTasks(request, user.id);
    this.taskGateway.emitTaskReordered(request.projectId, request.updates);
    return response;
  }

  @Put(':id/description')
  async updateDescription(
    @Param('id') taskId: string,
    @Body() request: UpdateDescriptionRequest,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.taskService.updateDescription(
      taskId,
      request,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.UPDATE_TASK_SUCCESS)
  @Put(':id/update')
  async updateTask(
    @Param('id') taskId: string,
    @Body() request: TaskRequest,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.taskService.updateTask(
      taskId,
      request,
      user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_TASK_SUCCESS)
  @Delete(':id/delete')
  async deleteTask(@Param('id') taskId: string, @CurrentUser() user: Payload) {
    const response = await this.taskService.deleteTask(taskId, user.id);
    return response;
  }

  @Message(ResponseMessage.APPROVE_TASK_SUCCESS)
  @Post(':id/approve')
  async approveTask(@Param('id') taskId: string, @CurrentUser() user: Payload) {
    const response = await this.taskService.approveTask(taskId, user.id);
    this.taskGateway.emitTaskUpdated(response.projectId, response);
    return response;
  }
}
