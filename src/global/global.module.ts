import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module } from '@nestjs/common';
import { WsAuthService } from './ws/ws-auth.service';
import { WsLoggerService } from './ws/ws-logger.service';
import { WsErrorService } from './ws/ws-error.service';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/modules/auth/auth.module';

@Global()
@Module({
  imports: [HttpModule, RedisModule, AuthModule],
  providers: [
    PrismaService,
    Logger,
    WsAuthService,
    WsLoggerService,
    WsErrorService,
  ],
  exports: [
    PrismaService,
    Logger,
    HttpModule,
    RedisModule,
    WsAuthService,
    WsLoggerService,
    WsErrorService,
  ],
})
export class GlobalModule {}
