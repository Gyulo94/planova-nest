import { Image } from '@prisma/client';

export class ImageResponse {
  id: string;
  url: string;
  workspaceId: string | null;
  projectId: string | null;
  taskId: string | null;

  static fromModel(image: Image): ImageResponse {
    const { id, url, workspaceId, projectId, taskId } = image;
    return {
      id,
      url,
      workspaceId: workspaceId ?? null,
      projectId: projectId ?? null,
      taskId: taskId ?? null,
    } as ImageResponse;
  }
}
