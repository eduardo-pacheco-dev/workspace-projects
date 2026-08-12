import * as crypto from 'crypto';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function buildResetToken(): { presentation: string; digest: string } {
  const random = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  const presentation = `${random}.${expiresAt}`;
  return { presentation, digest: hashResetToken(presentation) };
}

export function parseResetToken(
  presentation: string,
): { digest: string; expiresAt: number } | null {
  const separator = presentation.lastIndexOf('.');
  if (separator <= 0) return null;
  const expiresAt = Number(presentation.slice(separator + 1));
  if (!Number.isFinite(expiresAt)) return null;
  return { digest: hashResetToken(presentation), expiresAt };
}
