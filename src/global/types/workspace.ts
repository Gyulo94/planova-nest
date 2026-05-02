import { Prisma } from '@prisma/client';

export type WorkspaceWithImage = Prisma.WorkspaceGetPayload<{
  include: { image: true };
}>;
