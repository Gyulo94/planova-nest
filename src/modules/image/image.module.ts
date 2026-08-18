import { Module } from '@nestjs/common';
import { ImageService } from './service/image.service';
import { ImageController } from './controller/image.controller';
import { ImageRepository } from './repository/image.repository';

@Module({
  controllers: [ImageController],
  providers: [ImageService, ImageRepository],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}
