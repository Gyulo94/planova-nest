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
    const { name } = request;
    return {
      name,
      user: { connect: { id: userId } },
    };
  }
}
