import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './serivce/redis.service';
import { REDIS_HOST, REDIS_PORT } from 'src/global';

@Module({
  providers: [
    {
      provide: 'Redis',
      useFactory: () => {
        return new Redis({
          host: REDIS_HOST || 'localhost',
          port: REDIS_PORT || 6380,
        });
      },
    },
    RedisService,
  ],
  exports: ['Redis', RedisService],
})
export class RedisModule {}
