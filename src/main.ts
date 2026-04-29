import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './global/constants';
import { ApiInterceptor } from './global/api/api.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ApiInterceptor(reflector));
  await app.listen(PORT);
}
bootstrap();
