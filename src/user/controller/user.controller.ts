import { Controller, Delete, Get, Body, Put } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types/payload';
import { UpdateUserRequest } from '../request/update-user.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('session')
  async getSession(@CurrentUser() user: Payload) {
    const response = await this.userService.getSession(user.id);
    return response;
  }

  @Message(ResponseMessage.UPDATE_PROFILE_SUCCESS)
  @Put('update')
  async update(
    @CurrentUser() user: Payload,
    @Body() request: UpdateUserRequest,
  ) {
    const response = await this.userService.update(request, user.id);
    return response;
  }

  @Message(ResponseMessage.DELETE_USER_SUCCESS)
  @Delete('delete')
  async deleteUser(@CurrentUser() user: Payload) {
    await this.userService.deleteUser(user.id);
  }
}
