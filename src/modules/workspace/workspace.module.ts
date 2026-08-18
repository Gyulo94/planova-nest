import { Module } from '@nestjs/common';
import { WorkspaceService } from './service/workspace.service';
import { WorkspaceController } from './controller/workspace.controller';
import { WorkspaceRepository } from './repository/workspace.repository';
import { WorkspaceGateway } from './gateway/workspace.gateway';
import { ImageModule } from 'src/modules/image/image.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ImageModule, WorkspaceMemberModule, ActivityModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository, WorkspaceGateway],
  exports: [WorkspaceService, WorkspaceRepository],
})
export class WorkspaceModule {}
