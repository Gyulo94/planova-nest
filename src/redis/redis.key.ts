import { APP_NAME } from 'src/global';

const PREFIX = APP_NAME;

export const RedisKey = {
  verificationRegister: (token: string) => `verification:register:${token}`,
  verificationReset: (token: string) => `verification:reset:${token}`,
  userRefreshToken: (userId: string) => `RT:${userId}`,
  cachedTokens: (oldRefreshToken: string) => `cachedTokens:${oldRefreshToken}`,

  user: {
    session: (userId: string) => `${PREFIX}:session:${userId}`,
  },
  task: {
    projectTasks: (projectId: string) => `${PREFIX}:task:project:${projectId}`,
  },

  activity: {
    projectActivities: (projectId: string, page: number, limit: number) =>
      `${PREFIX}:activity:project:${projectId}:${page}:${limit}`,
    workspaceActivities: (workspaceId: string, page: number, limit: number) =>
      `${PREFIX}:activity:workspace:${workspaceId}:${page}:${limit}`,
  },
};
