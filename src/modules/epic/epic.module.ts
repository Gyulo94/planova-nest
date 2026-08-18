import { Module } from '@nestjs/common';
import { EpicController } from './controller/epic.controller';
import { EpicService } from './service/epic.service';
import { EpicRepository } from './repository/epic.repository';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [EpicController],
  providers: [EpicService, EpicRepository],
  exports: [EpicService, EpicRepository],
})
export class EpicModule {}
