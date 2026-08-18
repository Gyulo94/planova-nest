import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { redisStorage } from '@better-auth/redis-storage';
import Redis from 'ioredis';
import {
  CLIENT_URL,
  encrypt,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  SERVER_URL,
  SESSION_DATA,
  SESSION_TOKEN,
} from 'src/global';
import { PrismaService } from 'src/prisma/prisma.service';

export function createAuth(prisma: PrismaService, redis: Redis) {
  const trustedOrigins = [CLIENT_URL].filter(Boolean) as string[];

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    advanced: {
      cookies: {
        session_token: {
          name: SESSION_TOKEN,
        },
        session_data: {
          name: SESSION_DATA,
        },
      },
    },
    databaseHooks: {
      account: {
        create: {
          before: async (account) => {
            if (account.accessToken) {
              account.accessToken = encrypt(account.accessToken);
            }
            return { data: account };
          },
        },
      },
    },

    secondaryStorage: redisStorage({
      client: redis,
      keyPrefix: 'planova:auth:',
    }),

    emailAndPassword: {
      enabled: false,
    },

    socialProviders: {
      github: {
        clientId: GITHUB_CLIENT_ID || '',
        clientSecret: GITHUB_CLIENT_SECRET,
        scopes: ['user:email', 'repo'],
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7,
      },
    },

    baseURL: SERVER_URL,
    trustedOrigins,
  });
}
