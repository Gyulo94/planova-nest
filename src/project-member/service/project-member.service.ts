import { Injectable } from '@nestjs/common';
import { ProjectMemberRepository } from '../repository/project-member.repository';

@Injectable()
export class ProjectMemberService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
  ) {}

  async createProjectMember(projectId: string, userId: string) {
    const response = await this.projectMemberRepository.create(
      projectId,
      userId,
    );
    return response;
  }
}
