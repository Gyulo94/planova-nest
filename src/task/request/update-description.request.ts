import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateDescriptionRequest {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  tempImageUrls?: string[];
}
