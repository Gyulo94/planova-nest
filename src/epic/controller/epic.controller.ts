import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EpicService } from '../service/epic.service';
import { EpicRequest } from '../request/epic.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { Payload } from 'src/global/types';
import { EpicResponse } from '../response/epic.response';

@Controller('epic')
export class EpicController {
  constructor(private readonly epicService: EpicService) {}

  @Post()
  @Message(ResponseMessage.CREATE_EPIC_SUCCESS)
  async create(
    @CurrentUser() user: Payload,
    @Body() request: EpicRequest,
  ): Promise<EpicResponse> {
    return this.epicService.create(user.id, request);
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
    @CurrentUser() user: Payload,
    @Body() request: EpicRequest,
  ): Promise<EpicResponse> {
    return this.epicService.update(id, user.id, request);
  }

  @Delete(':id')
  @Message(ResponseMessage.DELETE_EPIC_SUCCESS)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: Payload,
  ): Promise<EpicResponse> {
    return this.epicService.delete(id, user.id);
  }
}
