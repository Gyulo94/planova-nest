import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './repository/user.repository';
import { ImageModule } from 'src/image/image.module';
import { EmailService } from 'src/email/service/email.service';

@Module({
  imports: [ImageModule],
  controllers: [UserController],
  providers: [UserService, EmailService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
