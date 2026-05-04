import { ProjectWithImage } from 'src/global/types';

export class ProjectResponse {
  id: string;
  name: string;
  image?: string;

  static fromModel(model: ProjectWithImage): ProjectResponse {
    const response = new ProjectResponse();
    response.id = model.id;
    response.name = model.name;
    response.image = model.image?.url;

    return response;
  }
}
