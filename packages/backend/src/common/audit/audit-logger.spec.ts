import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { AuditLogger } from './audit-logger';

jest.mock('fs');

describe('AuditLogger', () => {
  let logger: AuditLogger;
  let appendSpy: jest.Mock;

  beforeEach(() => {
    logger = new AuditLogger('logs/test-security.log');
    appendSpy = fs.appendFileSync as jest.Mock;
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  const lastEvent = () => JSON.parse(appendSpy.mock.calls[0][1] as string);

  it('should log a login success', () => {
    logger.loginSuccess('a@b.com', '1.1.1.1');

    expect(appendSpy).toHaveBeenCalled();
    expect(lastEvent()).toMatchObject({ event: 'login_success', email: 'a@b.com', ip: '1.1.1.1' });
  });

  it('should log a login failure with reason', () => {
    logger.loginFailure('a@b.com', '1.1.1.1', 'bad_password');

    expect(lastEvent()).toMatchObject({
      event: 'login_failure',
      email: 'a@b.com',
      ip: '1.1.1.1',
      reason: 'bad_password',
    });
  });

  it('should log an account lockout', () => {
    logger.accountLocked('a@b.com', '1.1.1.1');

    expect(lastEvent()).toMatchObject({ event: 'account_locked', email: 'a@b.com' });
  });

  it('should log a password reset', () => {
    logger.passwordReset(7);

    expect(lastEvent()).toMatchObject({ event: 'password_reset', userId: 7 });
  });

  it('should log a registration', () => {
    logger.register('a@b.com');

    expect(lastEvent()).toMatchObject({ event: 'register', email: 'a@b.com' });
  });

  it('should not throw when the log file cannot be written', () => {
    appendSpy.mockImplementation(() => {
      throw new Error('disk full');
    });

    expect(() => logger.loginFailure('a@b.com')).not.toThrow();
  });
});
