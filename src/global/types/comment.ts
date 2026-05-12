import { Prisma } from '@prisma/client';

export type CommentPayload = Prisma.CommentGetPayload<{
  include: {
    user: true;
  };
}>;

export type CommentDetailPayload = Prisma.CommentGetPayload<{
  include: {
    task: {
      include: {
        project: true;
      };
    };
  };
}>;
