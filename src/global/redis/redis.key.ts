import { APP_NAME } from '../constants';

const PREFIX = APP_NAME;

export const RedisKey = {
  register: {
    userInfoByEmail: (email: string): string =>
      `${PREFIX}:register:userInfo:${email}`,
    email: (email: string) => `${PREFIX}:register:${email}`,
  },
  login: {
    refreshToken: (userId: string) => `${PREFIX}:RT:${userId}`,
  },

  user: {
    session: (userId: string) => `${PREFIX}:session:${userId}`,
  },
};
