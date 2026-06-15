import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Message } from 'src/global/decorators/message.decorator';
import { ResponseMessage } from 'src/global/enums/response-message.enum';
import { clearCookies, setCookies } from 'src/global/utils';
import type { Request, Response } from 'express';
import { Provider, User } from '@prisma/client';
import { Public } from 'src/global/decorators/public.decorator';
import { CLIENT_URL } from 'src/global/constants';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ResetPasswordRequest } from '../request/reset-password.request';
import { CreateUserRequest } from 'src/user/request/create-user.request';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly LOGGER = new Logger(AuthController.name);

  @Message(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @Post('register')
  async register(@Body() request: CreateUserRequest) {
    const response = await this.authService.register(request);
    return response;
  }

  @Message(ResponseMessage.VERIFICATION_SUCCESS)
  @Post('verify')
  async verify(@Body() request: { token: string; type: string }) {
    const response = await this.authService.verify(request.token, request.type);
    return response;
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);
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
    clearCookies(res);
  }

  @Message(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @Post('reset-password/send')
  async sendResetPasswordMail(@Body('email') email: string) {
    await this.authService.sendResetPasswordMail(email);
  }

  @Message(ResponseMessage.VERIFICATION_SUCCESS)
  @Get('reset-password/verify')
  async verifyResetPasswordToken(@Query('token') token: string) {
    console.log(token);
    const response = await this.authService.verify(token, 'reset');
    return response;
  }

  @Message(ResponseMessage.PASSWORD_RESET_SUCCESS)
  @Put('reset-password')
  async resetPassword(@Body() request: ResetPasswordRequest) {
    const response = await this.authService.resetPassword(request);
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
