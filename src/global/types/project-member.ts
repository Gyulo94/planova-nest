import { Prisma } from '@prisma/client';

export type ProjectMemberWithUserAndProject = Prisma.ProjectMemberGetPayload<{
  include: {
    user: true;
    project: {
      include: {
        image: true;
      };
    };
  };
}>;
