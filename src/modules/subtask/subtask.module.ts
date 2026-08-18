import { Module } from '@nestjs/common';
import { SubtaskService } from './service/subtask.service';
import { SubtaskController } from './controller/subtask.controller';
import { SubtaskRepository } from './repository/subtask.repository';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [SubtaskController],
  providers: [SubtaskService, SubtaskRepository],
  exports: [SubtaskService],
})
export class SubtaskModule {}
