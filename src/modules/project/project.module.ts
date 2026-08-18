import { Module } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { ProjectRepository } from './repository/project.repository';
import { ImageModule } from 'src/modules/image/image.module';
import { ProjectMemberModule } from 'src/modules/project-member/project-member.module';
import { LabelModule } from 'src/modules/label/label.module';
import { ActivityModule } from 'src/modules/activity/activity.module';

@Module({
  imports: [ImageModule, ProjectMemberModule, LabelModule, ActivityModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
