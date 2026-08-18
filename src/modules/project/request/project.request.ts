import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProjectRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  workspaceId: string;

  @IsString()
  @IsOptional()
  image?: string;

  static toModel(request: ProjectRequest): Prisma.ProjectCreateInput {
    const { name, description, workspaceId } = request;
    return {
      name,
      description,
      ...(workspaceId ? { workspace: { connect: { id: workspaceId } } } : {}),
    } as Prisma.ProjectCreateInput;
  }
}
