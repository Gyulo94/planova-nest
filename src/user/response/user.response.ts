import { Provider, User } from '@prisma/client';

export class UserResponse {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: Provider;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(user: User | null): UserResponse | null {
    if (!user) {
      return null;
    }
    const { id, email, name, image, provider, createdAt, updatedAt } = user;
    return {
      id,
      email,
      name,
      image,
      provider,
      createdAt,
      updatedAt,
    };
  }
}
