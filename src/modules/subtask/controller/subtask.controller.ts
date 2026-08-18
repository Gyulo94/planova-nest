import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { UseGuards, Session } from '@nestjs/common';
import { ProjectMemberGuard } from 'src/global';
import { SubtaskService } from '../service/subtask.service';
import { SubtaskRequest } from '../request/subtask.request';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('subtasks')
@UseGuards(ProjectMemberGuard)
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Post(':taskId')
  async create(
    @Param('taskId') taskId: string,
    @Body('title') title: string,
    @Session() session: UserSession,
  ) {
    return this.subtaskService.createSubtask(taskId, title, session.user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: SubtaskRequest,
    @Session() session: UserSession,
  ) {
    return this.subtaskService.updateSubtask(id, request, session.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.subtaskService.deleteSubtask(id, session.user.id);
  }

  @Get('task/:taskId')
  async findByTaskId(@Param('taskId') taskId: string) {
    return this.subtaskService.findByTaskId(taskId);
  }
}
