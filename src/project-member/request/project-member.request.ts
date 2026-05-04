import { IsArray, IsString } from 'class-validator';

export class InviteProjectMemberRequest {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
