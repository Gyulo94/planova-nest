import { Prisma } from '@prisma/client';

export type ProjectWithImage = Prisma.ProjectGetPayload<{
  include: { image: true };
}>;
