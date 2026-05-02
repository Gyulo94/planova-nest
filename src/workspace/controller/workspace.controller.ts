import { Body, Controller, Post } from '@nestjs/common';
import { WorkspaceService } from '../service/workspace.service';
import { WorkspaceRequest } from '../request/workspace.request';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types/payload';
import { WorkspaceResponse } from '../response/workspace.response';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('create')
  async createWorkspace(
    @Body() request: WorkspaceRequest,
    @CurrentUser() user: Payload,
  ): Promise<WorkspaceResponse> {
    const response: WorkspaceResponse =
      await this.workspaceService.createWorkspace(request, user.id);
    return response;
  }
}
