import { Prisma } from '@prisma/client';

export type WorkspacePayload = Prisma.WorkspaceGetPayload<{
  include: { image: true };
}>;
