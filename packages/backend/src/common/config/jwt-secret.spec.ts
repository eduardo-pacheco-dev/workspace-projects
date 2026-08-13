import { getJwtSecret } from './jwt-secret';

describe('getJwtSecret', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('should throw when the variable is not set', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow('JWT_SECRET');
  });

  it('should throw for the legacy default placeholder', () => {
    process.env.JWT_SECRET = 'default-secret-change-in-production';
    expect(() => getJwtSecret()).toThrow();
  });

  it('should throw for the .env.example placeholder', () => {
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
    expect(() => getJwtSecret()).toThrow();
  });

  it('should throw for a short secret', () => {
    process.env.JWT_SECRET = 'too-short';
    expect(() => getJwtSecret()).toThrow();
  });

  it('should return a strong secret', () => {
    process.env.JWT_SECRET = 'a'.repeat(40);
    expect(getJwtSecret()).toBe('a'.repeat(40));
  });
});
