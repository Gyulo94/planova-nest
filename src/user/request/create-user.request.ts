import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;

  static toEntity(
    request: CreateUserRequest,
    hashedPassword: string,
  ): Prisma.UserCreateInput {
    const { email, name } = request;
    return {
      email,
      name,
      password: hashedPassword,
    };
  }
}
