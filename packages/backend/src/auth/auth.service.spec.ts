import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { buildResetToken } from './reset-token';
import { AuditLogger } from '../common/audit/audit-logger';
import { UsersService } from '../users/users.service';
import { User } from '../users/domain/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    findByResetToken: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

  const audit = {
    loginSuccess: jest.fn(),
    loginFailure: jest.fn(),
    accountLocked: jest.fn(),
    passwordReset: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditLogger, useValue: audit },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('should create an inactive user awaiting activation and return a generic message', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.register({
        name: 'Maria',
        email: 'maria@email.com',
        password: '123456',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'maria@email.com', role: 'user', status: 'inactive' }),
      );
      expect(audit.register).toHaveBeenCalledWith('maria@email.com');
      expect(result.message).toContain('Registration');
    });

    it('should not reveal whether the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(new User({ id: 1, email: 'dup@email.com' }));

      const result = await service.register({
        name: 'X',
        email: 'dup@email.com',
        password: '123456',
      });

      expect(usersService.create).not.toHaveBeenCalled();
      expect(result.message).toContain('Registration');
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(
        new User({ id: 1, name: 'Admin', email: 'admin@admin.com', password: 'hashed', role: 'master', status: 'active' }),
      );

      const result = await service.login({ email: 'admin@admin.com', password: '123456' });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, tokenVersion: 0 });
      expect(result.access_token).toBe('signed-token');
      expect(result.user.email).toBe('admin@admin.com');
    });

    it('should reject when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'x@email.com', password: '123456' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject an inactive user even with the correct password', async () => {
      usersService.findByEmail.mockResolvedValue(
        new User({ id: 1, email: 'admin@admin.com', password: 'hashed', role: 'user', status: 'inactive' }),
      );

      await expect(service.login({ email: 'admin@admin.com', password: '123456' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(
        new User({ id: 1, email: 'admin@admin.com', password: 'hashed', role: 'user', status: 'active' }),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'admin@admin.com', password: 'errada' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should store a reset token for an existing user', async () => {
      usersService.findByEmail.mockResolvedValue(new User({ id: 1, email: 'user@email.com' }));

      const result = await service.forgotPassword({ email: 'user@email.com' });

      expect(usersService.update).toHaveBeenCalledWith(1, { resetToken: expect.any(String) });
      expect(result.message).toContain('reset link');
    });

    it('should return a generic message for a missing user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'nao-existe@email.com' });

      expect(usersService.update).not.toHaveBeenCalled();
      expect(result.message).toContain('reset link');
    });
  });

  describe('resetPassword', () => {
    it('should reset the password and clear the token', async () => {
      const { presentation, digest } = buildResetToken();
      usersService.findByResetToken.mockResolvedValue(new User({ id: 1, email: 'user@email.com' }));

      const result = await service.resetPassword({ token: presentation, password: 'nova123' });

      expect(usersService.findByResetToken).toHaveBeenCalledWith(digest);
      expect(usersService.update).toHaveBeenCalledWith(1, {
        password: 'hashed-password',
        resetToken: null,
        tokenVersion: 1,
      });
      expect(audit.passwordReset).toHaveBeenCalledWith(1);
      expect(result.message).toContain('reset');
    });

    it('should reject an invalid token', async () => {
      await expect(
        service.resetPassword({ token: 'invalido', password: 'nova123' }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.findByResetToken).not.toHaveBeenCalled();
    });

    it('should reject an expired token', async () => {
      const expiredToken = `abc.${Date.now() - 1000}`;

      await expect(
        service.resetPassword({ token: expiredToken, password: 'nova123' }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.findByResetToken).not.toHaveBeenCalled();
    });

    it('should reject a well-formed token with no matching user', async () => {
      const { presentation } = buildResetToken();
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: presentation, password: 'nova123' }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('account lockout', () => {
    const activeUser = () =>
      new User({ id: 1, email: 'admin@admin.com', password: 'hashed', role: 'user', status: 'active' });

    it('should lock an account after repeated failed logins from the same IP', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        await expect(
          service.login({ email: 'admin@admin.com', password: 'errada' }, '1.1.1.1'),
        ).rejects.toThrow(UnauthorizedException);
      }

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.login({ email: 'admin@admin.com', password: 'certa' }, '1.1.1.1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledTimes(5);
      expect(audit.accountLocked).toHaveBeenCalledWith('admin@admin.com', '1.1.1.1');
    });

    it('should not lock the account for a different IP', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        await expect(
          service.login({ email: 'admin@admin.com', password: 'errada' }, '1.1.1.1'),
        ).rejects.toThrow(UnauthorizedException);
      }

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login(
        { email: 'admin@admin.com', password: 'certa' },
        '2.2.2.2',
      );
      expect(result.access_token).toBe('signed-token');
    });

    it('should reset the failure counter on a successful login', async () => {
      usersService.findByEmail.mockResolvedValue(activeUser());
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValue(true);

      await expect(
        service.login({ email: 'admin@admin.com', password: 'errada' }, '1.1.1.1'),
      ).rejects.toThrow(UnauthorizedException);
      const result = await service.login({ email: 'admin@admin.com', password: 'certa' }, '1.1.1.1');
      expect(result.access_token).toBe('signed-token');

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      for (let i = 0; i < 4; i++) {
        await expect(
          service.login({ email: 'admin@admin.com', password: 'errada' }, '1.1.1.1'),
        ).rejects.toThrow(UnauthorizedException);
      }

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.login({ email: 'admin@admin.com', password: 'certa' }, '1.1.1.1'),
      ).resolves.toBeTruthy();
    });
  });
});
