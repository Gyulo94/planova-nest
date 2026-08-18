import { Module } from '@nestjs/common';
import { MilestoneController } from './controller/milestone.controller';
import { MilestoneService } from './service/milestone.service';
import { MilestoneRepository } from './repository/milestone.repository';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [MilestoneController],
  providers: [MilestoneService, MilestoneRepository],
  exports: [MilestoneService, MilestoneRepository],
})
export class MilestoneModule {}
