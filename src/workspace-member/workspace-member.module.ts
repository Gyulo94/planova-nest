import { Module } from '@nestjs/common';
import { WorkspaceMemberController } from './controller/workspace-member.controller';
import { WorkspaceMemberService } from './service/workspace-member.service';
import { WorkspaceMemberRepository } from './repository/workspace-member.repository';
import { ActivityModule } from 'src/activity/activity.module';
import { ProjectMemberModule } from 'src/project-member/project-member.module';

@Module({
  controllers: [WorkspaceMemberController],
  providers: [WorkspaceMemberService, WorkspaceMemberRepository],
  imports: [ActivityModule, ProjectMemberModule],
  exports: [WorkspaceMemberService, WorkspaceMemberRepository],
})
export class WorkspaceMemberModule {}
