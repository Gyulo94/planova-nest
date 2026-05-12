import { Image } from '@prisma/client';

export class ImageResponse {
  id: string;
  url: string;
  workspaceId: string | null;
  projectId: string | null;
  taskId: string | null;

  static fromModel(image: Image): ImageResponse;
  static fromModel(image: any): ImageResponse {
    const response = new ImageResponse();
    response.id = image.id;
    response.url = image.url;
    response.workspaceId = image.workspaceId ?? null;
    response.projectId = image.projectId ?? null;
    response.taskId = image.taskId ?? null;
    return response;
  }
}
