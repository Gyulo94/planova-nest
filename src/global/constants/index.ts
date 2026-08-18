export const PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const APP_NAME = process.env.APP_NAME;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);
export const SOCKET_PATH = process.env.SOCKET_PATH;
export const CLIENT_URL = process.env.CLIENT_URL;
export const SERVER_URL = process.env.SERVER_URL;
export const FILE_URL = process.env.FILE_URL;
export const LOGO = process.env.LOGO;
export const SESSION_TOKEN = process.env.SESSION_TOKEN;
export const SESSION_DATA = process.env.SESSION_DATA;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export const DEFAULT_TASK_LABELS = [
  { name: '기획', bgColor: '#e0f2fe', textColor: '#0c4a6e' },
  { name: '디자인', bgColor: '#fce7f3', textColor: '#9d174d' },
  { name: '개발', bgColor: '#dbeafe', textColor: '#1e3a8a' },
  { name: '테스트', bgColor: '#dcfce7', textColor: '#15803d' },
  { name: '버그', bgColor: '#fee2e2', textColor: '#7f1d1d' },
];
