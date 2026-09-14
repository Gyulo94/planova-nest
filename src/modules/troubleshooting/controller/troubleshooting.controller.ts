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
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Message, ProjectMemberGuard, ResponseMessage } from 'src/global';
import { CreateTroubleshootingRequest } from '../request/create-troubleshooting.request';
import { UpdateTroubleshootingRequest } from '../request/update-troubleshooting.request';
import { TroubleshootingService } from '../service/troubleshooting.service';

@Controller('project/:projectId/troubleshooting')
@UseGuards(ProjectMemberGuard)
export class TroubleshootingController {
  constructor(
    private readonly troubleshootingService: TroubleshootingService,
  ) {}

  @Post('create')
  @Message(ResponseMessage.CREATE_TROUBLESHOOTING_SUCCESS)
  create(
    @Param('projectId') projectId: string,
    @Session() session: UserSession,
    @Body() request: CreateTroubleshootingRequest,
  ) {
    const response = this.troubleshootingService.create(
      projectId,
      session.user.id,
      request,
    );
    return response;
  }

  @Get('project/:projectId')
  findAll(@Param('projectId') projectId: string) {
    const response = this.troubleshootingService.findAllByProjectId(projectId);
    return response;
  }

  @Get(':id')
  findById(@Param('projectId') projectId: string, @Param('id') id: string) {
    const response = this.troubleshootingService.findById(id, projectId);
    return response;
  }

  @Put(':id/update')
  @Message(ResponseMessage.UPDATE_TROUBLESHOOTING_SUCCESS)
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() request: UpdateTroubleshootingRequest,
  ) {
    const response = this.troubleshootingService.update(
      id,
      projectId,
      session.user.id,
      request,
    );
    return response;
  }

  @Delete(':id/delete')
  @Message(ResponseMessage.DELETE_TROUBLESHOOTING_SUCCESS)
  delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
    const response = this.troubleshootingService.delete(
      id,
      projectId,
      session.user.id,
    );
    return response;
  }
}
