import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import {
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
  SOCIAL_CALLBACK_URL,
} from 'src/global/constants';
import { SocialUserRequest } from 'src/user/request/social-user.request';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly userService: UserService) {
    super({
      clientID: KAKAO_CLIENT_ID!,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: `${SOCIAL_CALLBACK_URL}/kakao`,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ) {
    const { _json } = profile;
    const kakaoAccount = _json?.kakao_account ?? {};
    const email: string | null = kakaoAccount?.email ?? null;
    const name: string | null =
      kakaoAccount?.profile?.nickname ?? profile.displayName ?? null;
    const image: string | null =
      kakaoAccount?.profile?.profile_image_url ?? null;

    if (!email) {
      return done(
        new Error(
          '카카오 계정에서 이메일을 가져올 수 없습니다. 이메일 동의 항목을 확인해주세요.',
        ),
        null,
      );
    }

    try {
      const request: SocialUserRequest = {
        email,
        name,
        image,
        provider: 'KAKAO',
      };
      const user = await this.userService.findOrCreateSocialUser(request);
      done(null, user);
    } catch (err) {
      done(null, { error: err });
    }
  }
}
