import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Session,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { TaskRequest } from '../request/task.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { ReorderTaskRequest } from '../request/reorder-task.request';
import { TaskGateway } from '../gateway/task.gateway';
import { UpdateDescriptionRequest } from '../request/update-description.request';
import { ProjectMemberGuard } from 'src/global';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Role } from 'src/global';

@Controller('project/:projectId/task')
@UseGuards(ProjectMemberGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskGateway: TaskGateway,
  ) {}

  @Message(ResponseMessage.CREATE_TASK_SUCCESS)
  @Post('create')
  async createTask(
    @Body() request: TaskRequest,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.createTask(
      request,
      session.user.id,
    );
    return response;
  }

  @Get('project/:projectId')
  async findTasksByProjectId(
    @Param('projectId') projectId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.findTasksByProjectId(
      projectId,
      session.user.id,
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
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.reorderTasks(
      request,
      session.user.id,
    );
    this.taskGateway.emitTaskReordered(request.projectId, request.updates);
    return response;
  }

  @Put(':id/description')
  async updateDescription(
    @Param('id') taskId: string,
    @Body() request: UpdateDescriptionRequest,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.updateDescription(
      taskId,
      request,
      session.user.id,
    );
    return response;
  }

  @Message(ResponseMessage.UPDATE_TASK_SUCCESS)
  @Put(':id/update')
  async updateTask(
    @Param('id') taskId: string,
    @Body() request: TaskRequest,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.updateTask(
      taskId,
      request,
      session.user.id,
    );
    return response;
  }

  @Message(ResponseMessage.DELETE_TASK_SUCCESS)
  @Delete(':id/delete')
  async deleteTask(
    @Param('id') taskId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.deleteTask(taskId, session.user.id);
    return response;
  }

  @Role('OWNER', 'ADMIN')
  @Message(ResponseMessage.APPROVE_TASK_SUCCESS)
  @Post(':id/approve')
  async approveTask(
    @Param('id') taskId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.taskService.approveTask(
      taskId,
      session.user.id,
    );
    if (response && response.projectId) {
      this.taskGateway.emitTaskUpdated(response.projectId, response);
    }
    return response;
  }
}
