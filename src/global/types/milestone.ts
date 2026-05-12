import { Prisma } from '@prisma/client';

export type MilestonePayload = Prisma.MilestoneGetPayload<{
  include: {
    project: true;
    epics: true;
  };
}>;
