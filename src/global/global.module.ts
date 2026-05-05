import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import { WsAuthService } from './ws/ws-auth.service';
import { WsLoggerService } from './ws/ws-logger.service';
import { WsErrorService } from './ws/ws-error.service';

@Global()
@Module({
  imports: [HttpModule, RedisModule],
  providers: [
    PrismaService,
    JwtService,
    Logger,
    WsAuthService,
    WsLoggerService,
    WsErrorService,
  ],
  exports: [
    PrismaService,
    JwtService,
    Logger,
    HttpModule,
    RedisModule,
    WsAuthService,
    WsLoggerService,
    WsErrorService,
  ],
})
export class GlobalModule {}
