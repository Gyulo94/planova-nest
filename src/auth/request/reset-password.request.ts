import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  newPassword: string;

  static toEntity(userId: string, newPassword: string): Prisma.UserUpdateArgs {
    return {
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    };
  }
}
