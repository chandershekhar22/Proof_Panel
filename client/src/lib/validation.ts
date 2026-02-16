export const VALID_ROLES = ['panel_company', 'insight_company', 'panelist'] as const;
export type Role = typeof VALID_ROLES[number];

export const VALID_CATEGORIES = ['technology', 'healthcare', 'financial', 'education', 'b2b', 'vehicle'] as const;
export type Category = typeof VALID_CATEGORIES[number];

export const VALID_TARGET_CATEGORIES = [...VALID_CATEGORIES, 'all'] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  return UUID_REGEX.test(str);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role);
}

export function isValidCategory(cat: string): boolean {
  return (VALID_CATEGORIES as readonly string[]).includes(cat);
}

export function isValidTargetCategory(cat: string): boolean {
  return (VALID_TARGET_CATEGORIES as readonly string[]).includes(cat);
}

export function determineTargetCategory(audienceText: string, explicitCategory?: string): string {
  if (explicitCategory) return explicitCategory;
  const text = audienceText.toLowerCase();
  if (text.includes('technology') || text.includes('developer') || text.includes('tech')) return 'technology';
  if (text.includes('healthcare') || text.includes('health') || text.includes('medical')) return 'healthcare';
  if (text.includes('financial') || text.includes('finance')) return 'financial';
  if (text.includes('education') || text.includes('teacher')) return 'education';
  if (text.includes('b2b') || text.includes('decision maker')) return 'b2b';
  if (text.includes('vehicle') || text.includes('automotive') || text.includes('car')) return 'vehicle';
  return 'all';
}
