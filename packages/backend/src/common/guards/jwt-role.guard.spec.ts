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
    guard = new JwtRoleGuard(settingsService as unknown as SettingsService);
  });

  describe('canActivate', () => {
    it('should bypass authentication for public auth paths', async () => {
      await expect(guard.canActivate(makeContext('/auth/login'))).resolves.toBe(true);
      await expect(guard.canActivate(makeContext('/auth/register'))).resolves.toBe(true);
      await expect(guard.canActivate(makeContext('/auth/forgot-password'))).resolves.toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should allow master on any path', () => {
      const ctx = makeContext('/users');
      expect(guard.handleRequest(null, { id: 1, role: 'master' }, null, ctx)).toEqual({
        id: 1,
        role: 'master',
      });
    });

    it('should allow user on allowed module paths', () => {
      const paths = [
        '/tasks',
        '/tasks/5',
        '/service-orders',
        '/service-orders/2',
        '/collaborators',
        '/collaborators/3',
        '/stations',
        '/stations/4',
        '/radio-links',
        '/radio-links/6',
        '/projects',
        '/projects/2',
        '/clients',
        '/clients/7',
        '/users',
        '/attachments',
        '/comments',
        '/lpus',
        '/teams',
      ];
      for (const path of paths) {
        const ctx = makeContext(path);
        expect(() => guard.handleRequest(null, { id: 1, role: 'user' }, null, ctx)).not.toThrow();
      }
    });

    it('should allow user on own profile path', () => {
      const ctx = makeContext('/users/5');
      expect(() => guard.handleRequest(null, { id: 5, role: 'user' }, null, ctx)).not.toThrow();
    });

    it('should deny user on restricted paths', () => {
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
      ];
      for (const path of paths) {
        const ctx = makeContext(path);
        expect(() => guard.handleRequest(null, { id: 1, role: 'user' }, null, ctx)).toThrow(
          ForbiddenException,
        );
      }
    });
  });
});
