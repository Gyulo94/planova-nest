import { Module } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { ProjectRepository } from './repository/project.repository';
import { ImageModule } from 'src/image/image.module';
import { ProjectMemberModule } from 'src/project-member/project-member.module';
import { WorkspaceMemberModule } from 'src/workspace-member/workspace-member.module';
import { LabelModule } from 'src/label/label.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    ImageModule,
    ProjectMemberModule,
    WorkspaceMemberModule,
    LabelModule,
    ActivityModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
