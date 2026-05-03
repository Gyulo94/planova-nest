import { Prisma } from '@prisma/client';

export type WorkspaceMemberWithUserAndWorkspace =
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      user: true;
      workspace: {
        include: {
          image: true;
        };
      };
    };
  }>;
