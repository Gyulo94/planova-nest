import { Prisma } from '@prisma/client';

export type IdeaPayload = Prisma.IdeaGetPayload<{
  include: {
    project: true;
    user: true;
    workspace: true;
    task: true;
    label: true;
  };
}>;
