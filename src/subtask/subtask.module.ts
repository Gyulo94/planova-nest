import { Module } from '@nestjs/common';
import { SubtaskService } from './service/subtask.service';
import { SubtaskController } from './controller/subtask.controller';
import { SubtaskRepository } from './repository/subtask.repository';
import { ActivityModule } from 'src/activity/activity.module';
import { RedisModule } from 'src/global/redis/redis.module';

@Module({
  imports: [ActivityModule, RedisModule],
  controllers: [SubtaskController],
  providers: [SubtaskService, SubtaskRepository],
  exports: [SubtaskService],
})
export class SubtaskModule {}
