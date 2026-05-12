import { ProjectMember, Role } from '@prisma/client';
import { ProjectMemberWithUserAndProject } from 'src/global/types/project-member';
import { ProjectResponse } from 'src/project/response/project.response';
import { UserResponse } from 'src/user/response/user.response';

export class ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
  user: UserResponse | null;
  project: ProjectResponse | null;

  static fromModel(model: ProjectMember): ProjectMemberResponse;
  static fromModel(
    model: ProjectMemberWithUserAndProject,
  ): ProjectMemberResponse;
  static fromModel(model: any): ProjectMemberResponse {
    const response = new ProjectMemberResponse();
    response.id = model.id;
    response.projectId = model.projectId;
    response.userId = model.userId;
    response.role = model.role;
    response.joinedAt = model.joinedAt;

    if ('user' in model && model.user) {
      response.user = UserResponse.fromModel(model.user);
    }

    if ('project' in model && model.project) {
      response.project = ProjectResponse.fromModel(model.project);
    }

    return response;
  }
}
