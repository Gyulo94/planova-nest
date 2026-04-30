import { Prisma, Provider } from '@prisma/client';

export class SocialUserRequest {
  email: string;
  name: string | null;
  image: string | null;
  provider: Provider;

  static toModel(request: SocialUserRequest): Prisma.UserCreateInput {
    const { email, name, image, provider } = request;
    return {
      email,
      name,
      image,
      provider,
    };
  }
}
