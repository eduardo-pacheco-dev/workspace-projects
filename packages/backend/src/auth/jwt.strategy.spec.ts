import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { User } from '../users/domain/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const usersService = { findById: jest.fn() };

  beforeAll(() => {
    process.env.JWT_SECRET = 'a'.repeat(40);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  it('should return the public profile for an active user', async () => {
    usersService.findById.mockResolvedValue(
      new User({ id: 1, name: 'Admin', email: 'admin@admin.com', role: 'master', companyId: null, status: 'active' }),
    );

    const result = await strategy.validate({ sub: 1, email: 'admin@admin.com' });

    expect(result).toEqual({
      id: 1,
      email: 'admin@admin.com',
      name: 'Admin',
      role: 'master',
      companyId: null,
    });
  });

  it('should reject a user that no longer exists', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 99, email: 'x@email.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject an inactive user', async () => {
    usersService.findById.mockResolvedValue(
      new User({ id: 1, name: 'Admin', email: 'admin@admin.com', role: 'user', status: 'inactive' }),
    );

    await expect(strategy.validate({ sub: 1, email: 'admin@admin.com' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
