import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailRequest {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsString()
  @IsNotEmpty()
  type: 'register' | 'reset';
}
