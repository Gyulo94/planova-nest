import { ProjectWithImage } from 'src/global/types';

export class ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  image?: string;

  static fromModel(model: ProjectWithImage, image?: string): ProjectResponse {
    const { id, name, description } = model;
    const response = new ProjectResponse();
    response.id = id;
    response.name = name;
    response.description = description;
    response.image = image;

    return response;
  }
}
