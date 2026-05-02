import { WorkspaceWithImage } from 'src/global/types';

export class WorkspaceResponse {
  id: string;
  name: string;
  image?: string;

  static fromModel(
    model: WorkspaceWithImage,
    image?: string,
  ): WorkspaceResponse {
    const { id, name } = model;
    const response = new WorkspaceResponse();
    response.id = id;
    response.name = name;
    response.image = image;

    return response;
  }
}
