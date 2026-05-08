import { Module } from '@nestjs/common';
import { MilestoneController } from './controller/milestone.controller';
import { MilestoneService } from './service/milestone.service';
import { MilestoneRepository } from './repository/milestone.repository';
import { ActivityModule } from 'src/activity/activity.module';
import { ProjectMemberModule } from 'src/project-member/project-member.module';

@Module({
  imports: [ActivityModule, ProjectMemberModule],
  controllers: [MilestoneController],
  providers: [MilestoneService, MilestoneRepository],
  exports: [MilestoneService, MilestoneRepository],
})
export class MilestoneModule {}
