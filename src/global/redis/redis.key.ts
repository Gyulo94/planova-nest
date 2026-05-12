import { APP_NAME } from '../constants';

const PREFIX = APP_NAME;

export const RedisKey = {
  token: (token: string) => `${token}`,
  register: {
    userInfoByEmail: (email: string): string =>
      `${PREFIX}:register:userInfo:${email}`,
    email: (email: string) => `${PREFIX}:register:${email}`,
  },
  login: {
    refreshToken: (userId: string) => `${PREFIX}:RT:${userId}`,
    oldRefreshToken: (userId: string) => `${PREFIX}:RT_OLD:${userId}`,
  },
  resetPassword: {
    email: (email: string) => `${PREFIX}:reset:${email}`,
  },

  user: {
    session: (userId: string) => `${PREFIX}:session:${userId}`,
  },
  task: {
    projectTasks: (projectId: string) =>
      `${PREFIX}:task:project:${projectId}`,
  },

  activity: {
    projectActivities: (projectId: string, page: number, limit: number) =>
      `${PREFIX}:activity:project:${projectId}:${page}:${limit}`,
    workspaceActivities: (workspaceId: string, page: number, limit: number) =>
      `${PREFIX}:activity:workspace:${workspaceId}:${page}:${limit}`,
  },
};
