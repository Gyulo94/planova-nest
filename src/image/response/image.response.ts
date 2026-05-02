import { Image } from '@prisma/client';

export class ImageResponse {
  id: string;
  url: string;
  workspaceId: string | null;
  projectId: string | null;

  static fromModel(image: Image): ImageResponse {
    const { id, url, workspaceId, projectId } = image;
    return {
      id,
      url,
      workspaceId: workspaceId ? workspaceId : null,
      projectId: projectId ? projectId : null,
    } as ImageResponse;
  }
}
