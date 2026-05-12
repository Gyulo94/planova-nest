import { Prisma } from '@prisma/client';

export type EpicPayload = Prisma.EpicGetPayload<{
  include: {
    project: true;
    user: true;
    workspace: true;
    _count: {
      select: { tasks: true };
    };
    tasks: true;
    milestone: true;
  };
}>;
