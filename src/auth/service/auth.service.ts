import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcryptjs';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { TokenService } from './token.service';
import { User } from '@prisma/client';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';
import { JWT_REFRESH_KEY } from 'src/global/constants';
import { Request } from 'express';
import { TokenResponse } from '../response/token.response';
import { CreateUserRequest } from 'src/user/request/create-user.request';
import { ResetPasswordRequest } from '../request/reset-password.request';
import { EmailService } from 'src/email/service/email.service';
import { AuthRequest } from '../request/auth.request';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
  ) {}

  private readonly LOGGER = new Logger(AuthService.name);

  register(request: CreateUserRequest) {
    return this.userService.register(request);
  }

  verify(token: string, type: string) {
    if (!token) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    if (type === 'register') {
      return this.verifyRegister(token);
    } else if (type === 'reset') {
      return this.verifyResetPassword(token);
    }

    throw new ApiException(ErrorCode.VERIFICATION_FAILED);
  }

  private async verifyRegister(token: string) {
    const redisKey = RedisKey.verificationRegister(token);
    const cachedUserData = await this.redis.get(redisKey);
    if (!cachedUserData) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    const userData = JSON.parse(cachedUserData) as CreateUserRequest;

    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      await this.redis.del(redisKey);
      throw new ApiException(ErrorCode.ALREADY_EXIST_EMAIL);
    }

    await this.userService.create(userData);

    await this.redis.del(redisKey);
  }

  async login(request: AuthRequest) {
    const user = await this.validateUser(request);
    return this.generateTokens(user);
  }

  async generateTokens(user: Omit<User, 'password'>): Promise<TokenResponse> {
    const redisKey = RedisKey.userRefreshToken(user.id);

    const payload = {
      id: user.id,
    };

    const tokenResponse = await this.tokenService.generateTokens(payload);

    const existingToken = await this.redis.get(redisKey);
    if (existingToken) {
      await this.redis.del(redisKey);
    }
    await this.redis.set(
      redisKey,
      tokenResponse.refreshToken,
      7 * 24 * 60 * 60,
    );

    return tokenResponse;
  }

  async refresh(req: Request): Promise<TokenResponse> {
    const oldRefreshToken = req.cookies['refreshToken'];
    if (!oldRefreshToken) {
      this.LOGGER.warn('리프레시 토큰 쿠키가 없습니다.');
      throw new ApiException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    }

    const cachedTokens = await this.redis.get(
      RedisKey.cachedTokens(oldRefreshToken),
    );
    if (cachedTokens) {
      return JSON.parse(cachedTokens) as TokenResponse;
    }

    const payload = await this.jwtService
      .verifyAsync(oldRefreshToken, {
        secret: JWT_REFRESH_KEY,
      })
      .catch((err) => {
        this.LOGGER.warn(`유효하지 않은 리프레시 토큰: ${err.message}`);
        throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
      });

    const user = await this.userService.findById(payload.id);
    if (!user) throw new ApiException(ErrorCode.USER_NOT_FOUND);

    const redisKey = RedisKey.userRefreshToken(user.id);
    const storedRefreshToken = await this.redis.get(redisKey);

    if (!storedRefreshToken || storedRefreshToken !== oldRefreshToken) {
      throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
    }

    const newTokens = await this.tokenService.generateTokens({ id: user.id });
    await Promise.all([
      this.redis.set(redisKey, newTokens.refreshToken, 7 * 24 * 60 * 60),
      this.redis.set(
        RedisKey.cachedTokens(oldRefreshToken),
        JSON.stringify(newTokens),
        5,
      ),
    ]);
    return newTokens;
  }

  async socialLogin(socialUser: any): Promise<TokenResponse> {
    if (socialUser?.error) {
      throw socialUser.error instanceof ApiException
        ? socialUser.error
        : new ApiException(ErrorCode.ALREADY_EXIST_LOCAL_USER);
    }

    if (!socialUser?.id) {
      throw new ApiException(ErrorCode.ALREADY_EXIST_LOCAL_USER);
    }

    const user = socialUser as User;
    return this.generateTokens(user);
  }

  private async verifyResetPassword(token: string) {
    const redisKey = RedisKey.verificationReset(token);
    const emailStr = await this.redis.get(redisKey);
    if (!emailStr) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    const email = JSON.parse(emailStr) as string;

    return { email };
  }

  async sendResetPasswordMail(email: string): Promise<void> {
    const existingUser = await this.userService.findByEmail(email);
    if (!existingUser) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    this.emailService.sendVerificationEmail({
      email,
      type: 'reset',
      payload: email,
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const response = await this.userService.resetPassword(request);
    return response;
  }

  async validateUser(request: AuthRequest) {
    const { email, password } = request;
    const user = await this.userService.findByEmail(email);
    if (user && user.password && bcrypt.compareSync(password, user.password)) {
      return user;
    } else if (user && user.provider !== 'LOCAL') {
      throw new ApiException(ErrorCode.ALREADY_EXIST_SOCIAL_USER);
    } else {
      throw new ApiException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
    }
  }
}
