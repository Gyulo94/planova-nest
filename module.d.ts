declare module NodeJS {
  interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production';
    APP_NAME: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
  }
}
