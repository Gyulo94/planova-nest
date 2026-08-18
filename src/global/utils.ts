import { ENCRYPTION_KEY } from './constants';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const SECRET_KEY = crypto
  .createHash('sha256')
  .update(String(ENCRYPTION_KEY))
  .digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(cipherText: string): string {
  const [ivHex, authTagHex, encryptedText] = cipherText.split(':');
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('유효하지 않은 암호화 데이터 포맷입니다.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
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

export function generateRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 60;
  const lightness = Math.floor(Math.random() * 10) + 85;

  const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const textColor = `hsl(${hue}, ${saturation + 10}%, 30%)`;

  return { bgColor, textColor };
}
