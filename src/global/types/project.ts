import { Prisma } from '@prisma/client';

export type ProjectPayload = Prisma.ProjectGetPayload<{
  include: { image: true };
}>;
