import { Module } from '@nestjs/common';
import { IdeaController } from './controller/idea.controller';
import { IdeaService } from './service/idea.service';
import { IdeaRepository } from './repository/idea.repository';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [IdeaController],
  providers: [IdeaService, IdeaRepository],
  exports: [IdeaService, IdeaRepository],
})
export class IdeaModule {}
