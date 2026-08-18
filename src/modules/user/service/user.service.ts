import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../repository/user.repository';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { User } from '@prisma/client';
import { UserResponse } from '../response/user.response';
import { UpdateUserRequest } from '../request/update-user.request';
import { ImageService } from 'src/modules/image/service/image.service';
import { RedisKey } from 'src/redis/redis.key';
import { RedisService } from 'src/redis/serivce/redis.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redis: RedisService,
  ) {}

  private readonly LOGGER = new Logger(UserService.name);

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.userRepository.findByEmail(email);
    return response;
  }

  async findById(id: string): Promise<User | null> {
    const response = await this.userRepository.findById(id);
    return response;
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
