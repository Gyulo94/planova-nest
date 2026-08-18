import { Injectable } from '@nestjs/common';
import { Image, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(url: string): Promise<Image> {
    const result = await this.prisma.image.create({
      data: {
        url,
      },
    });
    return result;
  }

  async saveAll(
    data: Prisma.ImageCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    const result = await this.prisma.image.createMany({
      data,
    });
    return result;
  }

  findAllByModelId(entityIds: string[], entity: string): Promise<Image[]> {
    const idKey = `${entity}Id`;
    return this.prisma.image.findMany({
      where: {
        [idKey]: { in: entityIds },
      },
    });
  }

  async deleteMany(
    entityIds: string[],
    entity: string,
  ): Promise<Prisma.BatchPayload> {
    const idKey = `${entity}Id`;
    const result = await this.prisma.image.deleteMany({
      where: {
        [idKey]: { in: entityIds },
      },
    });
    return result;
  }
}
