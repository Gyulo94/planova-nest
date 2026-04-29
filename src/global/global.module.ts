import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [HttpModule, RedisModule],
  providers: [PrismaService, JwtService, Logger],
  exports: [PrismaService, JwtService, Logger, HttpModule, RedisModule],
})
export class GlobalModule {}
