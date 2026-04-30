import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from 'src/user/user.module';
import { TokenService } from './service/token.service';
import { EmailModule } from 'src/email/email.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
