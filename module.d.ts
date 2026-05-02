declare module NodeJS {
  interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production';
    APP_NAME: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_KEY: string;
    JWT_SECRET_KEY_EXPIRES_IN: string;
    JWT_REFRESH_KEY_EXPIRES_IN: string;
    CLIENT_URL: string;
    EMAIL_URL: string;
    FILE_URL: string;
    LOGO: string;
    SENDER_EMAIL: string;
    SENDER_PWD: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    KAKAO_CLIENT_ID: string;
    KAKAO_CLIENT_SECRET: string;
  }
}
