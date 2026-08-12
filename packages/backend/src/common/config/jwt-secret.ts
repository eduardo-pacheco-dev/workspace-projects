const KNOWN_WEAK_JWT_SECRETS = [
  'default-secret-change-in-production',
  'your-secret-key-change-in-production',
];

const MIN_JWT_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH || KNOWN_WEAK_JWT_SECRETS.includes(secret)) {
    throw new Error(
      'JWT_SECRET environment variable must be set to a strong, non-default value (at least 32 characters).',
    );
  }
  return secret;
}
