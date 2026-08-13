import { User } from './user.entity';
import {
  isMaster,
  isActiveUser,
  canSeeUser,
  roleRequiresCompany,
  MASTER_ROLE,
  INACTIVE_STATUS,
  USER_ROLES,
} from './user-rules';

describe('User domain', () => {
  describe('constructor', () => {
    it('should default status to inactive and role to user', () => {
      const user = new User({ name: 'Admin', email: 'a@admin.com' });
      expect(user.status).toBe(INACTIVE_STATUS);
      expect(user.role).toBe('user');
    });

    it('should preserve provided values', () => {
      const user = new User({
        id: 1,
        name: 'Maria',
        email: 'maria@email.com',
        role: 'master',
        companyId: null,
        company: { id: 2, nome: 'Empresa A' },
      });

      expect(user.id).toBe(1);
      expect(user.name).toBe('Maria');
      expect(user.role).toBe(MASTER_ROLE);
      expect(user.companyId).toBeNull();
      expect(user.company?.nome).toBe('Empresa A');
    });
  });

  describe('USER_ROLES', () => {
    it('should list the supported roles', () => {
      expect(USER_ROLES).toEqual([
        'master',
        'admin',
        'supervisor',
        'coordenador',
        'analista',
        'technician',
        'user',
      ]);
    });
  });

  describe('isMaster', () => {
    it('should be true for master', () => {
      expect(isMaster({ role: 'master' })).toBe(true);
    });

    it('should be false otherwise', () => {
      expect(isMaster({ role: 'user' })).toBe(false);
      expect(isMaster(undefined)).toBe(false);
      expect(isMaster(null)).toBe(false);
    });
  });

  describe('isActiveUser', () => {
    it('should be true for an active user', () => {
      expect(isActiveUser({ status: 'active' })).toBe(true);
    });

    it('should be false for an inactive or unknown user', () => {
      expect(isActiveUser({ status: 'inactive' })).toBe(false);
      expect(isActiveUser(undefined)).toBe(false);
      expect(isActiveUser(null)).toBe(false);
    });
  });

  describe('roleRequiresCompany', () => {
    it('should be false for master', () => {
      expect(roleRequiresCompany('master')).toBe(false);
    });

    it('should be true for other roles', () => {
      expect(roleRequiresCompany('user')).toBe(true);
      expect(roleRequiresCompany('admin')).toBe(true);
    });
  });

  describe('canSeeUser', () => {
    it('should let a master see anyone', () => {
      expect(canSeeUser({ role: 'user', companyId: 5 }, { role: 'master', companyId: null })).toBe(true);
    });

    it('should let a regular user see a same-company non-master', () => {
      expect(canSeeUser({ role: 'user', companyId: 5 }, { role: 'user', companyId: 5 })).toBe(true);
    });

    it('should hide masters from a regular user', () => {
      expect(canSeeUser({ role: 'master', companyId: null }, { role: 'user', companyId: 5 })).toBe(false);
    });

    it('should hide users from another company', () => {
      expect(canSeeUser({ role: 'user', companyId: 99 }, { role: 'user', companyId: 5 })).toBe(false);
    });

    it('should be visible when there is no current user', () => {
      expect(canSeeUser({ role: 'user', companyId: 5 }, undefined)).toBe(true);
    });
  });
});
