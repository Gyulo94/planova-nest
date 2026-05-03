import { Controller, Get, Param } from '@nestjs/common';
import { WorkspaceMemberService } from '../service/workspace-member.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types';

@Controller('workspace-member')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Get('all/:workspaceId')
  async findWorkspaceMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: Payload,
  ) {
    const response = await this.workspaceMemberService.findWorkspaceMembers(
      workspaceId,
      user.id,
    );
    return response;
  }
}
