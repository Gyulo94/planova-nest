import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CLIENT_URL, PORT } from './global/constants';
import { ApiInterceptor } from './global/apis/api.interceptor';
import { HttpExceptionFilter } from './global/filters/http-exception.filter';
import { winstonLogger } from './global/config/winston.config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    bufferLogs: true,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: [CLIENT_URL],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter(winstonLogger));
  app.useGlobalInterceptors(new ApiInterceptor(reflector));
  await app.listen(PORT);
}
bootstrap();
