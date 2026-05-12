import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { Transactional } from 'src/global/decorators/transactional.decorator';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ImageRepository } from '../repository/image.repository';
import { ImageRequest } from '../request/image.request';
import { ImageResponse } from '../response/image.response';
import { APP_NAME, FILE_URL } from 'src/global/constants';

@Injectable()
export class ImageService {
  private readonly LOGGER = new Logger(ImageService.name);
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly httpService: HttpService,
  ) {}

  private SERVICE_NAME = APP_NAME.toLowerCase();

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file) => {
      const filename = file.originalname?.trim() ? file.originalname : 'file';
      formData.append('files', file.buffer, {
        filename,
        contentType: file.mimetype,
      });
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<string[]>(`${FILE_URL}/images`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      return response.data ?? [];
    } catch (error) {
      this.LOGGER.error(
        `파일 업로드 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  @Transactional()
  async createImages(request: ImageRequest): Promise<ImageResponse[]> {
    const { id, urls, entity } = request;

    const requestObj = {
      id,
      images: urls,
      existingImages: [],
      entity,
    };

    try {
      this.LOGGER.log(`1. 이미지 생성 요청 전송 중`);
      const res = await firstValueFrom(
        this.httpService.post(
          `${FILE_URL}/images/${this.SERVICE_NAME}/create`,
          requestObj,
        ),
      );
      this.LOGGER.log(`2. 이미지 생성 요청 완료`);

      this.LOGGER.log(`3. 이미지 생성 결과 처리 중`);
      console.log('응답받은 이미지들: ', res.data);
      const imagesObj: Prisma.ImageCreateManyInput[] = ImageRequest.toModel({
        id,
        urls: res.data.body.images ?? [],
        entity,
      });

      if (imagesObj.length === 0) {
        return [];
      }
      await this.imageRepository.saveAll(imagesObj);
      this.LOGGER.log(`4. 이미지들 저장 완료`);
      const images = await this.imageRepository.findAllByModelId([id], entity);
      this.LOGGER.log(`5. 이미지들 조회 완료`);
      const response = images.map((image) => ImageResponse.fromModel(image));

      this.LOGGER.log(
        `--------------------이미지 생성 서비스 종료--------------------`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Transactional()
  async updateImages(request: ImageRequest): Promise<ImageResponse[]> {
    const { id, urls, existingImages, entity } = request;
    this.LOGGER.log(
      `--------------------이미지 수정 서비스 실행--------------------`,
    );

    const requestObj = {
      id,
      images: urls,
      existingImages,
      entity,
    };

    try {
      this.LOGGER.log(`1. 이미지 수정 요청 전송 중`);
      const res = await firstValueFrom(
        this.httpService.put(
          `${FILE_URL}/images/${this.SERVICE_NAME}/update`,
          requestObj,
        ),
      );
      this.LOGGER.log(`2. 이미지 수정 요청 완료`);

      if (existingImages) {
        this.LOGGER.log(`3. 기존 이미지들 삭제 중`);
        await this.imageRepository.deleteMany([id], entity);
        this.LOGGER.log(`4. 기존 이미지들 삭제 완료`);
      }

      this.LOGGER.log(`5. 수정된 이미지들 저장 중`);
      const imagesObj: Prisma.ImageCreateManyInput[] = ImageRequest.toModel({
        id,
        urls: res.data.body.images ?? [],
        entity,
      });

      if (imagesObj.length === 0) {
        return [];
      }

      await this.imageRepository.saveAll(imagesObj);
      this.LOGGER.log(`6. 수정된 이미지들 저장 완료`);

      this.LOGGER.log(`7. 이미지들 조회 중`);
      const images = await this.imageRepository.findAllByModelId([id], entity);
      const response = images.map((image) => ImageResponse.fromModel(image));
      this.LOGGER.log(`8. 이미지들 변환 완료`);
      this.LOGGER.log(
        `--------------------이미지 수정 서비스 종료--------------------`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Transactional()
  async deleteImages(entityIds: string[], entity: string): Promise<boolean> {
    this.LOGGER.log(
      `--------------------이미지 삭제 서비스 실행--------------------`,
    );
    const requestObj = {
      ids: entityIds,
      serviceName: this.SERVICE_NAME,
      entity,
    };

    try {
      this.LOGGER.log(`1. 이미지 삭제 요청 전송 중`);
      const response = await firstValueFrom(
        this.httpService.delete<boolean>(
          `${FILE_URL}/images/${this.SERVICE_NAME}/delete`,
          { data: requestObj },
        ),
      );

      await this.imageRepository.deleteMany(entityIds, entity);

      this.LOGGER.log(`2. 이미지 삭제 요청 완료`);
      this.LOGGER.log(
        `--------------------이미지 삭제 서비스 종료--------------------`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findImageUrlsByModelId(
    entityId: string,
    entity: string,
  ): Promise<string[]> {
    const images = await this.imageRepository.findAllByModelId(
      [entityId],
      entity,
    );
    return images.map((image) => image.url);
  }

  async updateUserImages(request: ImageRequest): Promise<string[]> {
    const { id, urls, existingImages, entity } = request;
    this.LOGGER.log(
      `--------------------이미지 수정 서비스 실행--------------------`,
    );

    const requestObj = {
      id,
      images: urls,
      existingImages,
      entity,
    };

    try {
      this.LOGGER.log(`1. 이미지 수정 요청 전송 중`);
      const res = await firstValueFrom(
        this.httpService.put(
          `${FILE_URL}/images/${this.SERVICE_NAME}/update`,
          requestObj,
        ),
      );
      this.LOGGER.log(`2. 이미지 수정 요청 완료`);
      const response = res.data.body.images ?? [];
      this.LOGGER.log(`3. 이미지들 변환 완료`);
      this.LOGGER.log(
        `--------------------이미지 수정 서비스 종료--------------------`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserImages(
    entityIds: string[],
    entity: string,
  ): Promise<boolean> {
    this.LOGGER.log(
      `--------------------이미지 삭제 서비스 실행--------------------`,
    );
    const requestObj = {
      ids: entityIds,
      serviceName: this.SERVICE_NAME,
      entity,
    };

    try {
      this.LOGGER.log(`1. 이미지 삭제 요청 전송 중`);
      const response = await firstValueFrom(
        this.httpService.delete<boolean>(
          `${FILE_URL}/images/${this.SERVICE_NAME}/delete`,
          { data: requestObj },
        ),
      );

      this.LOGGER.log(
        `--------------------이미지 삭제 서비스 종료--------------------`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
