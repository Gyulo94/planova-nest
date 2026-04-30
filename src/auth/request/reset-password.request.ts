import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
}
