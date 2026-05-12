import { Project } from '@prisma/client';
import { ProjectPayload } from '../../global/types';

export class ProjectResponse {
  id: string;
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;

  static fromModel(model: ProjectPayload): ProjectResponse;
  static fromModel(model: Project): ProjectResponse;
  static fromModel(model: ProjectPayload | Project): ProjectResponse {
    const response = new ProjectResponse();
    response.id = model.id;
    response.name = model.name;
    if ('image' in model && model.image) {
      response.image = model.image.url;
    }
    response.createdAt = model.createdAt;
    response.updatedAt = model.updatedAt;

    return response;
  }
}
