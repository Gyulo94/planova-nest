import { User } from '@prisma/client';

export class UserResponse {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(user: User): UserResponse;
  static fromModel(user: User | null): UserResponse | null;
  static fromModel(user: User | null): UserResponse | null {
    if (!user) {
      return null;
    }
    const response = new UserResponse();
    response.id = user.id;
    response.email = user.email;
    response.name = user.name;
    response.image = user.image;
    response.createdAt = user.createdAt;
    response.updatedAt = user.updatedAt;
    return response;
  }
}
