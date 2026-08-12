export const USER_ROLES = [
  'master',
  'admin',
  'supervisor',
  'coordenador',
  'analista',
  'technician',
  'user',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MASTER_ROLE = 'master';
export const ACTIVE_STATUS = 'active';
export const INACTIVE_STATUS = 'inactive';

export function isMaster(currentUser?: { role?: string } | null): boolean {
  return currentUser?.role === MASTER_ROLE;
}

export function roleRequiresCompany(role: string): boolean {
  return role !== MASTER_ROLE;
}

export function canSeeUser(
  user: { role?: string; companyId?: number | null },
  currentUser?: { role?: string; companyId?: number | null } | null,
): boolean {
  if (!currentUser || isMaster(currentUser)) return true;
  return user.role !== MASTER_ROLE && user.companyId === currentUser.companyId;
}
