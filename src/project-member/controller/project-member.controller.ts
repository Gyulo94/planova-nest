import { Controller } from '@nestjs/common';
import { ProjectMemberService } from '../service/project-member.service';

@Controller('project-member')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}
}
