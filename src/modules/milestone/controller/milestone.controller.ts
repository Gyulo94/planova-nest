import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from '@nestjs/common';
import { MilestoneService } from '../service/milestone.service';
import {
  MilestoneRequest,
  UpdateMilestoneRequest,
} from '../request/milestone.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { ProjectMemberGuard } from 'src/global';

@Controller('milestone')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_MILESTONE_SUCCESS)
  @UseGuards(ProjectMemberGuard)
  async create(
    @Session() session: UserSession,
    @Body() request: MilestoneRequest,
  ) {
    return this.milestoneService.create(request, session.user.id);
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
    @Session() session: UserSession,
    @Body() request: UpdateMilestoneRequest,
  ) {
    return this.milestoneService.update(id, session.user.id, request);
  }

  @Delete(':id')
  @Message(ResponseMessage.DELETE_MILESTONE_SUCCESS)
  async delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.milestoneService.delete(id, session.user.id);
  }
}
