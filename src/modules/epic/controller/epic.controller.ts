import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Session,
} from '@nestjs/common';
import { EpicService } from '../service/epic.service';
import { EpicRequest } from '../request/epic.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { EpicResponse } from '../response/epic.response';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('epic')
export class EpicController {
  constructor(private readonly epicService: EpicService) {}

  @Post()
  @Message(ResponseMessage.CREATE_EPIC_SUCCESS)
  async create(
    @Session() session: UserSession,
    @Body() request: EpicRequest,
  ): Promise<EpicResponse> {
    return this.epicService.create(session.user.id, request);
  }

  @Get('project/:projectId')
  async findAllByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<EpicResponse[]> {
    return this.epicService.findAllByProjectId(projectId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<EpicResponse> {
    return this.epicService.findById(id);
  }

  @Put(':id/update')
  @Message(ResponseMessage.UPDATE_EPIC_SUCCESS)
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() request: EpicRequest,
  ): Promise<EpicResponse> {
    return this.epicService.update(id, session.user.id, request);
  }

  @Delete(':id')
  @Message(ResponseMessage.DELETE_EPIC_SUCCESS)
  async delete(
    @Param('id') id: string,
    @Session() session: UserSession,
  ): Promise<EpicResponse> {
    return this.epicService.delete(id, session.user.id);
  }
}
