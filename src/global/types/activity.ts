import { Prisma } from '@prisma/client';

export type ActivityPayload = Prisma.ActivityGetPayload<{
  include: {
    user: true;
  };
}>;
