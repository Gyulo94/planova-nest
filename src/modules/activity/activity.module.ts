import { Module } from '@nestjs/common';
import { ActivityService } from './service/activity.service';
import { ActivityController } from './controller/activity.controller';
import { ActivityRepository } from './repository/activity.repository';
import { GlobalModule } from 'src/global/global.module';
import { ProjectActivityController } from './controller/project-activity.controller';
import { WorkspaceActivityController } from './controller/workspace-activity.controller';

@Module({
  imports: [GlobalModule],
  controllers: [
    ActivityController,
    ProjectActivityController,
    WorkspaceActivityController,
  ],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
