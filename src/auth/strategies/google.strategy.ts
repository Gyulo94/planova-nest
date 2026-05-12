import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SOCIAL_CALLBACK_URL,
} from 'src/global/constants';
import { SocialUserRequest } from 'src/user/request/social-user.request';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userService: UserService) {
    super({
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: `${SOCIAL_CALLBACK_URL}/google`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { emails, displayName, photos } = profile;
    const email = emails?.[0]?.value ?? null;
    const image = photos?.[0]?.value ?? null;

    if (!email) {
      return done(
        new Error('Google 계정에서 이메일을 가져올 수 없습니다.'),
        undefined,
      );
    }
    const request: SocialUserRequest = {
      email,
      name: displayName ?? null,
      image,
      provider: 'GOOGLE',
    };

    try {
      const user = await this.userService.findOrCreateSocialUser(request);
      done(null, user);
    } catch (err) {
      done(null, { error: err });
    }
  }
}
