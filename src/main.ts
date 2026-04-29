import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './global/constants';
import { ApiInterceptor } from './global/apis/api.interceptor';
import { HttpExceptionFilter } from './global/filters/http-exception.filter';
import { winstonLogger } from './global/config/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    bufferLogs: true,
  });
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter(winstonLogger));
  app.useGlobalInterceptors(new ApiInterceptor(reflector));
  await app.listen(PORT);
}
bootstrap();
