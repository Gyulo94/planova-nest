import { Module } from '@nestjs/common';
import { LabelService } from './service/label.service';
import { LabelController } from './controller/label.controller';
import { LabelRepository } from './repository/label.repository';

@Module({
  controllers: [LabelController],
  providers: [LabelService, LabelRepository],
  exports: [LabelService, LabelRepository],
})
export class LabelModule {}
