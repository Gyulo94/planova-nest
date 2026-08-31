import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ReorderIdeaItem {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

export class ReorderIdeaRequest {
  @IsString()
  projectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderIdeaItem)
  updates: ReorderIdeaItem[];
}
