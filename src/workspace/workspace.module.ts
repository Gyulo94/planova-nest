import { Module } from '@nestjs/common';
import { WorkspaceService } from './service/workspace.service';
import { WorkspaceController } from './controller/workspace.controller';
import { WorkspaceRepository } from './repository/workspace.repository';
import { ImageModule } from 'src/image/image.module';
import { WorkspaceMemberModule } from 'src/workspace-member/workspace-member.module';

@Module({
  imports: [ImageModule, WorkspaceMemberModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService, WorkspaceRepository],
})
export class WorkspaceModule {}
