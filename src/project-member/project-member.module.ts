import { Module } from '@nestjs/common';
import { ProjectMemberService } from './service/project-member.service';
import { ProjectMemberController } from './controller/project-member.controller';
import { ProjectMemberRepository } from './repository/project-member.repository';

@Module({
  controllers: [ProjectMemberController],
  providers: [ProjectMemberService, ProjectMemberRepository],
  exports: [ProjectMemberService, ProjectMemberRepository],
})
export class ProjectMemberModule {}
