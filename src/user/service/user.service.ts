import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserRequest } from '../request/user.request';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { UserResponse } from '../response/user.response';
import { JWT_REFRESH_KEY_EXPIRES_IN } from 'src/global/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
  ) {}

  private readonly LOGGER = new Logger(UserService.name);

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.userRepository.findByEmail(email);
    return response;
  }

  async register(request: UserRequest): Promise<void> {
    await this.validateEmailNotExists(request.email);

    const hashedPassword = bcrypt.hashSync(request.password!, 10);

    const userInfoForRedis = {
      ...request,
      password: hashedPassword,
    };

    await this.redis.set(
      RedisKey.register.userInfoByEmail(request.email),
      JSON.stringify(userInfoForRedis),
      15 * 60,
    );
  }

  async saveUser(request: UserRequest): Promise<void> {
    await this.validateEmailNotExists(request.email);
    await this.userRepository.create(UserRequest.toModel(request));
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getSession(id: string): Promise<UserResponse | null> {
    const sessionKey = RedisKey.user.session(id);

    const redisData = await this.redis.get(sessionKey);
    if (redisData) {
      try {
        return JSON.parse(redisData);
      } catch (e) {
        this.LOGGER.warn(`Redis 세션 파싱 실패 - User ID: ${id}`);
      }
    }

    const user = await this.findById(id);
    if (!user) return null;

    const session = UserResponse.fromModel(user);

    this.redis
      .set(sessionKey, JSON.stringify(session), JWT_REFRESH_KEY_EXPIRES_IN)
      .catch((err) =>
        this.LOGGER.error(`Redis 캐싱 실패 - User ID: ${id}`, err),
      );

    return session;
  }

  private async validateEmailNotExists(email: string): Promise<void> {
    if (await this.findByEmail(email)) {
      throw new ApiException(ErrorCode.ALREADY_EXIST_EMAIL);
    }
  }
}
