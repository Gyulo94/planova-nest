import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/service/user.service';
import { UserRequest } from 'src/user/request/user.request';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { EmailRequest } from 'src/email/request/email.request';
import { EmailService } from 'src/email/service/email.service';
import { setCookies } from 'src/global/utils';
import type { Request, Response } from 'express';
import { User } from '@prisma/client';
import { Public } from 'src/global/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  private readonly LOGGER = new Logger(AuthController.name);

  @Message(ResponseMessage.SEND_EMAIL_SUCCESS)
  @Post('register')
  async register(@Body() request: UserRequest): Promise<void> {
    await this.userService.register(request);

    const emailRequest =
      await this.emailService.validateVerificationMailRequest({
        email: request.email,
        type: 'register',
      });

    this.emailService.sendVerificationMailInBackground(emailRequest);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Res() res: Response) {
    const user: User = req.user as User;
    const { accessToken, refreshToken } = await this.authService.login(user);
    return setCookies(res, accessToken, refreshToken);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(req);
    return setCookies(res, accessToken, refreshToken);
  }

  @Post('send-email')
  @Message(ResponseMessage.SEND_EMAIL_SUCCESS)
  async sendEmail(@Body() request: EmailRequest): Promise<void> {
    const emailServerRequest =
      await this.emailService.validateVerificationMailRequest(request);
    this.emailService.sendVerificationMailInBackground(emailServerRequest);
  }

  @Message(ResponseMessage.VERIFY_EMAIL_SUCCESS)
  @Post('verify-email')
  async verifyEmail(@Body() request: EmailRequest) {
    const response = await this.emailService.verifyEmail(request);
    return response;
  }
}
