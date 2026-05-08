import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MilestoneService } from '../service/milestone.service';
import {
  MilestoneRequest,
  UpdateMilestoneRequest,
} from '../request/milestone.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types';

@Controller('milestone')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_MILESTONE_SUCCESS)
  async create(
    @CurrentUser() user: Payload,
    @Body() request: MilestoneRequest,
  ) {
    return this.milestoneService.create(request, user.id);
  }

  @Get('project/:projectId')
  async findAllByProjectId(@Param('projectId') projectId: string) {
    return this.milestoneService.findAllByProjectId(projectId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.milestoneService.findById(id);
  }

  @Put(':id')
  @Message(ResponseMessage.UPDATE_MILESTONE_SUCCESS)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: Payload,
    @Body() request: UpdateMilestoneRequest,
  ) {
    return this.milestoneService.update(id, user.id, request);
  }

  @Delete(':id')
  @Message(ResponseMessage.DELETE_MILESTONE_SUCCESS)
  async delete(@Param('id') id: string, @CurrentUser() user: Payload) {
    return this.milestoneService.delete(id, user.id);
  }
}
