import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
