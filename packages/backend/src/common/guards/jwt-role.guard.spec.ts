import { ForbiddenException } from '@nestjs/common';
import { JwtRoleGuard } from './jwt-role.guard';

describe('JwtRoleGuard', () => {
  let guard: JwtRoleGuard;

  const makeContext = (path: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ path }),
      }),
    }) as any;

  beforeEach(() => {
    guard = new JwtRoleGuard();
  });

  describe('canActivate', () => {
    it('should bypass authentication for public auth paths', () => {
      expect(guard.canActivate(makeContext('/auth/login'))).toBe(true);
      expect(guard.canActivate(makeContext('/auth/register'))).toBe(true);
      expect(guard.canActivate(makeContext('/auth/forgot-password'))).toBe(true);
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
