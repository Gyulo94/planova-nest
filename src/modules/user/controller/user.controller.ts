import { Controller, Delete, Body, Put, Session } from '@nestjs/common';
import { UserService } from '../service/user.service';

import { UpdateUserRequest } from '../request/update-user.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Message(ResponseMessage.UPDATE_PROFILE_SUCCESS)
  @Put('update')
  async update(
    @Session() session: UserSession,
    @Body() request: UpdateUserRequest,
  ) {
    const response = await this.userService.update(request, session.user.id);
    return response;
  }

  @Message(ResponseMessage.DELETE_USER_SUCCESS)
  @Delete('delete')
  async deleteUser(@Session() session: UserSession) {
    await this.userService.deleteUser(session.user.id);
  }
}
