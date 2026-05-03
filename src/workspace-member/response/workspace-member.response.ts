import { Role } from '@prisma/client';
import { WorkspaceMemberWithUserAndWorkspace } from 'src/global/types/workspace-member';
import { UserResponse } from 'src/user/response/user.response';
import { WorkspaceResponse } from 'src/workspace/response/workspace.response';

export class WorkspaceMemberResponse {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
  user: UserResponse | null;
  workspace: WorkspaceResponse | null;

  static fromModel(
    model: WorkspaceMemberWithUserAndWorkspace,
  ): WorkspaceMemberResponse {
    const response = new WorkspaceMemberResponse();
    response.id = model.id;
    response.workspaceId = model.workspaceId;
    response.userId = model.userId;
    response.role = model.role;
    response.joinedAt = model.joinedAt;
    response.user = model.user ? UserResponse.fromModel(model.user) : null;
    response.workspace = model.workspace
      ? WorkspaceResponse.fromModel(model.workspace)
      : null;
    return response;
  }
}
