import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Message, ProjectMemberGuard, ResponseMessage, Role } from 'src/global';
import { UpdateProjectDocumentationRequest } from '../request/update-project-documentation.request';
import { ProjectDocumentationService } from '../service/project-documentation.service';

@Controller('project/:projectId/documentation')
@UseGuards(ProjectMemberGuard)
export class ProjectDocumentationController {
  constructor(private readonly service: ProjectDocumentationService) {}

  @Get()
  async find(@Param('projectId') projectId: string) {
    const response = await this.service.findByProjectId(projectId);
    return response;
  }

  @Post('generate')
  @Role('OWNER', 'ADMIN')
  @Message(ResponseMessage.GENERATE_DOCUMENTATION_SUCCESS)
  async generate(
    @Param('projectId') projectId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.service.generate(projectId, session.user.id);
    return response;
  }

  @Put('versions/:versionId')
  @Role('OWNER', 'ADMIN')
  @Message(ResponseMessage.UPDATE_DOCUMENTATION_SUCCESS)
  async update(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Session() session: UserSession,
    @Body() request: UpdateProjectDocumentationRequest,
  ) {
    const response = await this.service.update(
      projectId,
      versionId,
      session.user.id,
      request,
    );
    return response;
  }

  @Post('versions/:versionId/restore')
  @Role('OWNER', 'ADMIN')
  @Message(ResponseMessage.RESTORE_DOCUMENTATION_SUCCESS)
  async restore(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Session() session: UserSession,
  ) {
    const response = await this.service.restore(
      projectId,
      versionId,
      session.user.id,
    );
    return response;
  }
}
