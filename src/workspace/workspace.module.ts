import { Module } from '@nestjs/common';
import { WorkspaceService } from './service/workspace.service';
import { WorkspaceController } from './controller/workspace.controller';
import { WorkspaceRepository } from './repository/workspace.repository';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService, WorkspaceRepository],
})
export class WorkspaceModule {}
