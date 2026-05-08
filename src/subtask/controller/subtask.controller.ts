import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { SubtaskService } from '../service/subtask.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types';
import { SubtaskRequest } from '../request/subtask.request';

@Controller('subtasks')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Post(':taskId')
  async create(
    @Param('taskId') taskId: string,
    @Body('title') title: string,
    @CurrentUser() user: Payload,
  ) {
    return this.subtaskService.createSubtask(taskId, title, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: SubtaskRequest,
    @CurrentUser() user: Payload,
  ) {
    return this.subtaskService.updateSubtask(id, request, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: Payload) {
    return this.subtaskService.deleteSubtask(id, user.id);
  }

  @Get('task/:taskId')
  async findByTaskId(@Param('taskId') taskId: string) {
    return this.subtaskService.findByTaskId(taskId);
  }
}
