import { ForbiddenException } from '@nestjs/common';
import { JwtRoleGuard } from './jwt-role.guard';
import { SettingsService } from '../../settings/settings.service';
import { DEFAULT_USER_ALLOWED_PREFIXES } from './role-modules';

describe('JwtRoleGuard', () => {
  let guard: JwtRoleGuard;

  const settingsService = {
    getRoleModules: jest.fn().mockResolvedValue(DEFAULT_USER_ALLOWED_PREFIXES),
  };

  const makeContext = (path: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ path }),
      }),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsService.getRoleModules.mockResolvedValue(DEFAULT_USER_ALLOWED_PREFIXES);
    guard = new JwtRoleGuard(settingsService as unknown as SettingsService);
  });

  describe('canActivate', () => {
    it('should bypass authentication for public auth paths', () => {
      expect(guard.canActivate(makeContext('/auth/login'))).toBe(true);
      expect(guard.canActivate(makeContext('/auth/register'))).toBe(true);
      expect(guard.canActivate(makeContext('/auth/forgot-password'))).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should allow master on any path', async () => {
      const ctx = makeContext('/users');
      await expect(
        guard.handleRequest(null, { id: 1, role: 'master' }, null, ctx),
      ).resolves.toEqual({
        id: 1,
        role: 'master',
      });
    });

    it('should allow user on allowed module paths', async () => {
      const paths = [
        '/tasks',
        '/tasks/5',
        '/service-orders',
        '/service-orders/2',
        '/stations',
        '/stations/4',
        '/radio-links',
        '/radio-links/6',
        '/projects',
        '/projects/2',
        '/clients',
        '/clients/7',
        '/attachments',
        '/comments',
      ];
      for (const path of paths) {
        const ctx = makeContext(path);
        await expect(
          guard.handleRequest(null, { id: 1, role: 'user' }, null, ctx),
        ).resolves.toEqual({ id: 1, role: 'user' });
      }
    });

    it('should allow user on own profile path', async () => {
      const ctx = makeContext('/users/5');
      await expect(
        guard.handleRequest(null, { id: 5, role: 'user' }, null, ctx),
      ).resolves.toEqual({ id: 5, role: 'user' });
    });

    it('should allow user on paths configured via settings', async () => {
      settingsService.getRoleModules.mockResolvedValue(['/finance']);
      const ctx = makeContext('/finance/entries');
      await expect(
        guard.handleRequest(null, { id: 1, role: 'admin' }, null, ctx),
      ).resolves.toEqual({ id: 1, role: 'admin' });
    });

    it('should deny user on restricted paths', async () => {
      const paths = [
        '/finance',
        '/finance/entries',
        '/finance/reports/summary',
        '/settings',
        '/schedule',
        '/ms-project',
        '/jobs',
        '/contracts',
        '/proposals',
        '/companies',
        '/companies/1/freelancers',
        '/collaborators',
        '/collaborators/3',
        '/users',
        '/lpus',
        '/teams',
        '/pdca',
      ];
      for (const path of paths) {
        const ctx = makeContext(path);
        await expect(
          guard.handleRequest(null, { id: 1, role: 'user' }, null, ctx),
        ).rejects.toThrow(ForbiddenException);
      }
    });
  });
});
