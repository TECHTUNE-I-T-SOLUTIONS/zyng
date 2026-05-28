export type AdminRole = 'super' | 'admin' | 'sub' | 'moderator' | 'support';

export type AdminPermission =
  | 'dashboard.read'
  | 'users.manage'
  | 'content.moderate'
  | 'verification.manage'
  | 'submissions.manage'
  | 'notifications.manage'
  | 'schools.manage'
  | 'maintenance.manage'
  | 'database.read'
  | 'admins.manage';

export const ADMIN_ROLES: Record<AdminRole, { label: string; permissions: AdminPermission[] }> = {
  super: {
    label: 'Super Admin',
    permissions: ['dashboard.read', 'users.manage', 'content.moderate', 'verification.manage', 'submissions.manage', 'notifications.manage', 'schools.manage', 'maintenance.manage', 'database.read', 'admins.manage'],
  },
  admin: {
    label: 'Admin',
    permissions: ['dashboard.read', 'users.manage', 'content.moderate', 'verification.manage', 'submissions.manage', 'notifications.manage', 'schools.manage', 'maintenance.manage'],
  },
  sub: {
    label: 'Sub Admin',
    permissions: ['dashboard.read', 'users.manage', 'content.moderate', 'verification.manage', 'submissions.manage', 'notifications.manage'],
  },
  moderator: {
    label: 'Moderator',
    permissions: ['dashboard.read', 'content.moderate', 'verification.manage', 'notifications.manage'],
  },
  support: {
    label: 'Support',
    permissions: ['dashboard.read', 'submissions.manage', 'notifications.manage'],
  },
};

export function normalizeAdminRole(role?: string | null): AdminRole {
  if (role && role in ADMIN_ROLES) return role as AdminRole;
  return 'support';
}

export function adminHasPermission(role: string | null | undefined, permission: AdminPermission) {
  return ADMIN_ROLES[normalizeAdminRole(role)].permissions.includes(permission);
}
