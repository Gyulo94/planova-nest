import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../service/auth.service';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new ApiException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
    }
    return user;
  }
}
