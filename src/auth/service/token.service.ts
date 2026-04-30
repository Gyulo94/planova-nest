import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JWT_REFRESH_KEY,
  JWT_REFRESH_KEY_EXPIRES_IN,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_EXPIRES_IN,
} from 'src/global/constants';
import { Payload } from 'src/global/types/payload';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: Payload) {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: JWT_SECRET_KEY,
        expiresIn: JWT_SECRET_KEY_EXPIRES_IN,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: JWT_REFRESH_KEY,
        expiresIn: JWT_REFRESH_KEY_EXPIRES_IN,
      }),
    };
  }
}
