import { Prisma } from '@prisma/client';

export class ImageRequest {
  id: string;
  urls: string[];
  existingImages?: string[];
  entity: string;

  static toModel(request: ImageRequest): Prisma.ImageCreateManyInput[] {
    const { id, urls, entity } = request;
    const entityIdKey = `${entity}Id` as 'workspaceId' | 'projectId';

    return urls.map((url) => ({
      url,
      [entityIdKey]: id,
    }));
  }
}
