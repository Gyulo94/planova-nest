export const PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const APP_NAME = process.env.APP_NAME;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
export const JWT_SECRET_KEY_EXPIRES_IN = parseInt(
  process.env.JWT_SECRET_KEY_EXPIRES_IN,
  10,
);
export const JWT_REFRESH_KEY_EXPIRES_IN = parseInt(
  process.env.JWT_REFRESH_KEY_EXPIRES_IN,
  10,
);
export const CLIENT_URL = process.env.CLIENT_URL;
export const EMAIL_URL = process.env.EMAIL_URL;
export const FILE_URL = process.env.FILE_URL;
export const LOGO = process.env.LOGO;
export const SENDER_EMAIL = process.env.SENDER_EMAIL;
export const SENDER_PWD = process.env.SENDER_PWD;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
