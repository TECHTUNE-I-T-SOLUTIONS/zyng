import type { Persona, User } from '@/types';

export const ACTIVE_PERSONA_ALERT = 'You need to create and activate a persona before performing this action.';

export function getActivePersona(personas?: Persona[] | null) {
  return (personas || []).find((persona) => persona?.is_active) || null;
}

export function hasActivePersona(user?: Pick<User, 'personas'> | null) {
  return Boolean(getActivePersona(user?.personas));
}

export function maskUsername(value?: string | null) {
  const name = String(value || 'zynger').trim();
  if (name.length <= 2) return `${name[0] || 'z'}*`;
  if (name.length <= 4) return `${name[0]}${'*'.repeat(name.length - 1)}`;
  return `${name[0]}${'*'.repeat(Math.max(3, name.length - 2))}${name[name.length - 1]}`;
}

export function getPersonaDisplay(user?: any) {
  const persona = getActivePersona(user?.personas);
  const fallbackName = user?.z_name || user?.full_name || user?.phone || user?.email || 'zynger';
  const name = persona?.name || maskUsername(fallbackName);
  return {
    persona,
    name,
    avatar:
      persona?.avatar_url ||
      user?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  };
}

export function onlyActivePersonaOwners<T extends { user?: any; persona?: any }>(items: T[] = []) {
  return items.filter((item) => {
    if (item.persona?.is_active) return true;
    return hasActivePersona(item.user);
  });
}

export function graduationHasPassed(graduationDate?: string | null) {
  if (!graduationDate) return false;
  const date = new Date(graduationDate);
  if (Number.isNaN(date.getTime())) return false;
  return date <= new Date();
}
