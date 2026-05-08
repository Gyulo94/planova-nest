import { ProjectWithImage } from 'src/global/types';

export class ProjectResponse {
  id: string;
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;

  static fromModel(model: ProjectWithImage): ProjectResponse {
    const response = new ProjectResponse();
    response.id = model.id;
    response.name = model.name;
    response.image = model.image?.url;
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;

    return response;
  }
}
