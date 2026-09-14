import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTroubleshootingRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsString()
  @IsNotEmpty()
  solution: string;

  @IsUUID()
  taskId: string;
}
