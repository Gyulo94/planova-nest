import { Module } from '@nestjs/common';
import { WorkspaceMemberController } from './controller/workspace-member.controller';
import { WorkspaceMemberService } from './service/workspace-member.service';
import { WorkspaceMemberRepository } from './repository/workspace-member.repository';

@Module({
  controllers: [WorkspaceMemberController],
  providers: [WorkspaceMemberService, WorkspaceMemberRepository],
  exports: [WorkspaceMemberService, WorkspaceMemberRepository],
})
export class WorkspaceMemberModule {}
