import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  image?: string;

  @IsNotEmpty()
  password?: string;

  static toModel(request: UserRequest): Prisma.UserCreateInput {
    const { email, name, image, password } = request;
    return {
      email,
      name,
      image,
      password,
    };
  }
}
