import { Module } from '@nestjs/common';
import { WorkspaceMemberController } from './controller/workspace-member.controller';
import { WorkspaceMemberService } from './service/workspace-member.service';
import { WorkspaceMemberRepository } from './repository/workspace-member.repository';
import { ActivityModule } from 'src/modules/activity/activity.module';
import { ProjectMemberModule } from 'src/modules/project-member/project-member.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [ActivityModule, ProjectMemberModule, ProjectModule],
  controllers: [WorkspaceMemberController],
  providers: [WorkspaceMemberService, WorkspaceMemberRepository],
  exports: [WorkspaceMemberService, WorkspaceMemberRepository],
})
export class WorkspaceMemberModule {}
