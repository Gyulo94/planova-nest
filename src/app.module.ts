import { Module } from '@nestjs/common';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [GlobalModule],
  providers: [],
})
export class AppModule {}
