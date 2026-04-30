import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcryptjs';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { TokenService } from './token.service';
import { User } from '@prisma/client';
import { Payload } from 'src/global/types/payload';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';
import {
  JWT_REFRESH_KEY,
  JWT_REFRESH_KEY_EXPIRES_IN,
} from 'src/global/constants';
import { Request } from 'express';
import { TokenResponse } from '../response/token.response';
import { UserResponse } from 'src/user/response/user.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
  ) {}

  private readonly LOGGER = new Logger(AuthService.name);

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && user.password && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user;
      return result;
    } else if (user && user.provider !== 'LOCAL') {
      throw new ApiException(ErrorCode.ALREADY_EXIST_SOCIAL_USER);
    } else {
      throw new ApiException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
    }
  }

  async login(user: User): Promise<TokenResponse> {
    const payload: Payload = { id: user.id };
    const refreshKey = RedisKey.login.refreshToken(user.id);
    const sessionKey = RedisKey.user.session(user.id);

    await this.redis.del(refreshKey);
    await this.redis.del(sessionKey);

    const tokens = await this.tokenService.generateTokens(payload);
    const sessionData = UserResponse.fromModel(user);

    await Promise.all([
      this.redis.set(
        refreshKey,
        tokens.refreshToken,
        JWT_REFRESH_KEY_EXPIRES_IN,
      ),
      this.redis.set(
        sessionKey,
        JSON.stringify(sessionData),
        JWT_REFRESH_KEY_EXPIRES_IN,
      ),
    ]);

    return tokens;
  }

  async refresh(req: Request): Promise<TokenResponse> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken)
      throw new ApiException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);

    const payload = await this.jwtService
      .verifyAsync(refreshToken, {
        secret: JWT_REFRESH_KEY,
      })
      .catch(() => {
        throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
      });

    const refreshKey = RedisKey.login.refreshToken(payload.id);
    const sessionKey = RedisKey.user.session(payload.id);

    if (refreshToken !== (await this.redis.get(refreshKey))) {
      throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
    }

    const user = await this.userService.findById(payload.id);
    if (!user) throw new ApiException(ErrorCode.USER_NOT_FOUND);

    const newTokens = await this.tokenService.generateTokens({ id: user.id });

    await Promise.all([
      this.redis.set(
        refreshKey,
        newTokens.refreshToken,
        JWT_REFRESH_KEY_EXPIRES_IN,
      ),
      this.redis.set(
        sessionKey,
        JSON.stringify(UserResponse.fromModel(user)),
        JWT_REFRESH_KEY_EXPIRES_IN,
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

    return this.login(user);
  }
}
