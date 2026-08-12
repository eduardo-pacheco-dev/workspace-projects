import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { buildResetToken } from './reset-token';
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

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('should create an active user and return a generic message', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.register({
        name: 'Maria',
        email: 'maria@email.com',
        password: '123456',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'maria@email.com', role: 'user', status: 'active' }),
      );
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
      });
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
});
