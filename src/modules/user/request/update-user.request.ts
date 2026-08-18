import { Prisma } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  image?: string | null;

  static toModel(request: UpdateUserRequest): Prisma.UserUpdateInput {
    return {
      name: request.name,
      image: request.image,
    };
  }
}
