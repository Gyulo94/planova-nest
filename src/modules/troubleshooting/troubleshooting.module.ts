import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { TroubleshootingController } from './controller/troubleshooting.controller';
import { TroubleshootingRepository } from './repository/troubleshooting.repository';
import { TroubleshootingService } from './service/troubleshooting.service';

@Module({
  imports: [ActivityModule],
  controllers: [TroubleshootingController],
  providers: [TroubleshootingService, TroubleshootingRepository],
})
export class TroubleshootingModule {}
