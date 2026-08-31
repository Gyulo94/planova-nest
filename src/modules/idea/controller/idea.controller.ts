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
import { IdeaService } from '../service/idea.service';
import { IdeaRequest } from '../request/idea.request';
import { IdeaResponse } from '../response/idea.response';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { ProjectMemberGuard } from 'src/global';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ReorderIdeaRequest } from '../request/reorder-idea.request';

@Controller('project/:projectId/idea')
@UseGuards(ProjectMemberGuard)
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_IDEA_SUCCESS)
  async create(
    @Session() session: UserSession,
    @Body() request: IdeaRequest,
  ): Promise<IdeaResponse> {
    return this.ideaService.create(session.user.id, request);
  }

  @Get('project/:projectId')
  async findAllByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<IdeaResponse[]> {
    return this.ideaService.findAllByProjectId(projectId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<IdeaResponse> {
    return this.ideaService.findById(id);
  }

  @Put('reorder')
  async reorder(
    @Body() request: ReorderIdeaRequest,
    @Session() session: UserSession,
  ) {
    return this.ideaService.reorder(request, session.user.id);
  }

  @Put(':id/update')
  @Message(ResponseMessage.UPDATE_IDEA_SUCCESS)
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() request: IdeaRequest,
  ): Promise<IdeaResponse> {
    return this.ideaService.update(id, session.user.id, request);
  }

  @Delete(':id/delete')
  @Message(ResponseMessage.DELETE_IDEA_SUCCESS)
  async delete(
    @Param('id') id: string,
    @Session() session: UserSession,
  ): Promise<IdeaResponse> {
    return this.ideaService.delete(id, session.user.id);
  }
}
