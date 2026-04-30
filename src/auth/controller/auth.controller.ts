import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
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
import { clearCookies, setCookies } from 'src/global/utils';
import type { Request, Response } from 'express';
import { Provider, User } from '@prisma/client';
import { Public } from 'src/global/decorators/public.decorator';
import { CLIENT_URL } from 'src/global/constants';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ResetPasswordRequest } from '../request/reset-password.request';

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
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user: User = req.user as User;
    const { accessToken, refreshToken } = await this.authService.login(user);
    return setCookies(res, accessToken, refreshToken);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  async verifyEmail(
    @Body() request: EmailRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.emailService.verifyEmail(request);
    return response;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialCallback(req, res, Provider.GOOGLE);
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {}

  @Get('callback/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleSocialCallback(req, res, Provider.KAKAO);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req);
    clearCookies(res);
  }

  @Message(ResponseMessage.RESET_PASSWORD_SUCCESS)
  @Put('reset-password')
  async resetPassword(@Body() request: ResetPasswordRequest) {
    const response = await this.userService.resetPassword(request);
    return response;
  }

  private async handleSocialCallback(
    req: Request,
    res: Response,
    provider: Provider,
  ) {
    try {
      const { accessToken, refreshToken } = await this.authService.socialLogin(
        req.user,
      );

      setCookies(res, accessToken, refreshToken);

      return res.redirect(`${CLIENT_URL}?social=1&provider=${provider}`);
    } catch (error) {
      const errorCode =
        error instanceof ApiException
          ? error.getErrorCode()
          : 'SOCIAL_LOGIN_FAILED';

      return res.redirect(`${CLIENT_URL}/login?error=${errorCode}`);
    }
  }
}
