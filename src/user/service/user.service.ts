import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../repository/user.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { RedisService } from 'src/global/redis/serivce/redis.service';
import { RedisKey } from 'src/global/redis/redis.key';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { UserResponse } from '../response/user.response';
import { JWT_REFRESH_KEY_EXPIRES_IN } from 'src/global/constants';
import { SocialUserRequest } from '../request/social-user.request';
import { ResetPasswordRequest } from 'src/auth/request/reset-password.request';
import { UpdateUserRequest } from '../request/update-user.request';
import { ImageService } from 'src/image/service/image.service';
import { CreateUserRequest } from '../request/create-user.request';
import { EmailService } from 'src/email/service/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
    private readonly imageService: ImageService,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
  ) {}

  private readonly LOGGER = new Logger(UserService.name);

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.userRepository.findByEmail(email);
    return response;
  }

  async register(request: CreateUserRequest) {
    const existingUser = await this.findByEmail(request.email);
    if (existingUser) {
      throw new ApiException(ErrorCode.ALREADY_EXIST_EMAIL);
    }
    this.emailService.sendVerificationEmail({
      email: request.email,
      type: 'register',
      payload: request,
    });
  }

  async create(request: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(request.password, 10);
    const response = await this.userRepository.create(
      CreateUserRequest.toEntity(request, hashedPassword),
    );
    return response;
  }

  async findById(id: string): Promise<User | null> {
    const response = await this.userRepository.findById(id);
    return response;
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

  async findOrCreateSocialUser(request: SocialUserRequest): Promise<User> {
    const { email, provider } = request;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      if (existingUser.provider === provider) {
        return existingUser;
      }

      if (existingUser.provider === 'LOCAL') {
        throw new ApiException(ErrorCode.ALREADY_EXIST_LOCAL_USER);
      }

      throw new ApiException(ErrorCode.ALREADY_EXIST_SOCIAL_USER);
    }

    return this.userRepository.createSocialUser(
      SocialUserRequest.toModel(request),
    );
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const { email, token, newPassword } = request;
    const redisKey = RedisKey.verificationReset(token);
    const user = await this.findByEmail(email);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.resetPassword(
      ResetPasswordRequest.toEntity(user.id, hashedPassword),
    );
    await this.redis.del(redisKey);
  }

  async update(request: UpdateUserRequest, id: string) {
    const { image } = request;
    const user = await this.findById(id);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    let newImage: string[] = [];
    const imageRequest = {
      id,
      existingImages: user.image ? [user.image] : [],
      urls: image ? [image] : [],
      entity: 'user',
    };
    if (image !== '') {
      newImage = await this.imageService.updateUserImages(imageRequest);
      request.image = newImage.length > 0 ? newImage[0] : undefined;
    } else {
      await this.imageService.deleteUserImages([user.id], 'user');
      request.image = null;
    }
    const updatedUser = await this.userRepository.update(
      id,
      UpdateUserRequest.toModel(request),
    );
    const sessionKey = RedisKey.user.session(id);
    await this.redis.del(sessionKey);
    const response = UserResponse.fromModel(updatedUser);

    this.eventEmitter.emit('user.updated', response);

    return response;
  }

  async deleteUser(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    const isDeleted = await this.userRepository.delete(id);
    if (isDeleted) {
      await this.imageService.deleteUserImages([user.id], 'user');
    }
    const sessionKey = RedisKey.user.session(id);
    await this.redis.del(sessionKey);
  }
}
