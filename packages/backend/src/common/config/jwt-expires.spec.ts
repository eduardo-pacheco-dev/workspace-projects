import { getJwtExpiresIn } from './jwt-expires';

describe('getJwtExpiresIn', () => {
  const originalExpiresIn = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    if (originalExpiresIn === undefined) {
      delete process.env.JWT_EXPIRES_IN;
    } else {
      process.env.JWT_EXPIRES_IN = originalExpiresIn;
    }
  });

  it('should default to 8h', () => {
    delete process.env.JWT_EXPIRES_IN;
    expect(getJwtExpiresIn()).toBe('8h');
  });

  it('should return a valid configured duration', () => {
    process.env.JWT_EXPIRES_IN = '15m';
    expect(getJwtExpiresIn()).toBe('15m');
    process.env.JWT_EXPIRES_IN = '1d';
    expect(getJwtExpiresIn()).toBe('1d');
  });

  it('should throw for a non-duration value', () => {
    process.env.JWT_EXPIRES_IN = 'nonsense';
    expect(() => getJwtExpiresIn()).toThrow('JWT_EXPIRES_IN');
  });

  it('should throw for a duration longer than 7 days', () => {
    process.env.JWT_EXPIRES_IN = '9999d';
    expect(() => getJwtExpiresIn()).toThrow('JWT_EXPIRES_IN');
  });
});
