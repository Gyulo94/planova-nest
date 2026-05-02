import { WorkspaceWithImage } from 'src/global/types';

export class WorkspaceResponse {
  id: string;
  name: string;
  image?: string;

  static fromModel(model: WorkspaceWithImage): WorkspaceResponse {
    const { id, name, image } = model;
    const response = new WorkspaceResponse();
    response.id = id;
    response.name = name;
    response.image = image?.url;
    return response;
  }
}
