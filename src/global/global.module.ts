import { HttpModule } from '@nestjs/axios';
import { Global, Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [PrismaService, JwtService, Logger],
  exports: [PrismaService, JwtService, Logger, HttpModule],
})
export class GlobalModule {}
