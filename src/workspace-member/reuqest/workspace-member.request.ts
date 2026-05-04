import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class WorkspaceMemberRequest {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsNotEmpty()
  inviteCode: string;

  static toModel(
    request: WorkspaceMemberRequest,
    userId: string,
  ): Prisma.WorkspaceMemberCreateInput {
    return {
      workspace: {
        connect: {
          id: request.workspaceId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      role: 'MEMBER',
    };
  }
}
