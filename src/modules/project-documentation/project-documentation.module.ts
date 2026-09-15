import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { ProjectDocumentationController } from './controller/project-documentation.controller';
import { ProjectDocumentationRepository } from './repository/project-documentation.repository';
import { ProjectDocumentationService } from './service/project-documentation.service';

@Module({
  imports: [ActivityModule],
  controllers: [ProjectDocumentationController],
  providers: [ProjectDocumentationService, ProjectDocumentationRepository],
})
export class ProjectDocumentationModule {}
