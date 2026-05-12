import { Response } from 'express';
import {
  JWT_REFRESH_KEY_EXPIRES_IN,
  JWT_SECRET_KEY_EXPIRES_IN,
  NODE_ENV,
} from './constants';

export function setCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: JWT_SECRET_KEY_EXPIRES_IN * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: JWT_REFRESH_KEY_EXPIRES_IN * 1000,
  });
}

export function clearCookies(res: Response) {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });
}

export function generateInviteCode(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let inviteCode = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    inviteCode += characters.charAt(randomIndex);
  }
  return inviteCode;
}

export function extractImageSrcUrls(html: string): string[] {
  const srcRegex = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  const urls = new Set<string>();
  let match: RegExpExecArray | null = srcRegex.exec(html);

  while (match) {
    if (match[1]) {
      urls.add(match[1]);
    }
    match = srcRegex.exec(html);
  }

  return [...urls];
}

export function isSameUrlSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  if (aSet.size !== b.length) return false;
  return b.every((url) => aSet.has(url));
}