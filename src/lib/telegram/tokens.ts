import { randomBytes, createHash } from 'crypto';

export const CONNECTION_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateConnectionToken(): string {
  return `connect_${randomBytes(24).toString('hex')}`;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
