import { Workspace } from '@prisma/client';
import { WorkspacePayload } from 'src/global/types';

export class WorkspaceResponse {
  id: string;
  name: string;
  inviteCode: string | null;
  image?: string;

  static fromModel(model: Workspace): WorkspaceResponse;
  static fromModel(model: WorkspacePayload): WorkspaceResponse;
  static fromModel(model: any): WorkspaceResponse {
    const response = new WorkspaceResponse();
    response.id = model.id;
    response.name = model.name;
    response.inviteCode = model.inviteCode;
    if ('image' in model && model.image) {
      response.image = model.image.url;
    }

    return response;
  }
}
