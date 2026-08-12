const DEFAULT_JWT_EXPIRES_IN = '8h';
const MAX_JWT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

const UNIT_MULTIPLIERS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function toMilliseconds(value: string): number | null {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]);
  return amount * UNIT_MULTIPLIERS[match[2]];
}

export function getJwtExpiresIn(): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
  const ms = toMilliseconds(expiresIn);
  if (ms === null || ms <= 0 || ms > MAX_JWT_EXPIRES_MS) {
    throw new Error(
      'JWT_EXPIRES_IN must be a duration string like "15m", "8h" or "1d" (max 7 days).',
    );
  }
  return expiresIn;
}
