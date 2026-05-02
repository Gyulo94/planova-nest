import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class WorkspaceRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image: string;

  static toModel(
    request: WorkspaceRequest,
    userId: string,
  ): Prisma.WorkspaceCreateInput {
    const { name, image } = request;
    return {
      name,
      image: image ? { create: { url: image } } : undefined,
      user: { connect: { id: userId } },
    };
  }
}
