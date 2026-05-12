import { Prisma } from '@prisma/client';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateDescriptionRequest {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  tempImageUrls?: string[];

  static toModel(description: string): Prisma.TaskUpdateInput {
    return {
      description,
    }
  }
}
