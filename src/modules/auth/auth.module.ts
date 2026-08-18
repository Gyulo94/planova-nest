import { Module } from '@nestjs/common';
import { createAuth } from './auth';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  providers: [
    {
      provide: 'BETTER_AUTH',
      useFactory: createAuth,
      inject: [PrismaService, 'Redis'],
    },
  ],
  exports: ['BETTER_AUTH'],
})
export class AuthModule {}
