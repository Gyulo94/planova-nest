import { Controller, Get } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import type { Payload } from 'src/global/types/payload';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('session')
  async getSession(@CurrentUser() user: Payload) {
    const response = await this.userService.getSession(user.id);
    return response;
  }
}
