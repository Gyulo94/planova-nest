import { Module } from '@nestjs/common';
import { ActivityService } from './service/activity.service';
import { ActivityController } from './controller/activity.controller';
import { ActivityRepository } from './repository/activity.repository';
import { GlobalModule } from 'src/global/global.module';

@Module({
  imports: [GlobalModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
