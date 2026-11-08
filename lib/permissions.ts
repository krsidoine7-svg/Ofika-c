// =====================================================
// MATRICE DES PERMISSIONS PAR RÔLE
// =====================================================

import { UserRole, normalizeRole } from './roles'

export type Permission =
  // Permissions Générales & Client
  | 'view:own_data'
  | 'edit:own_data'
  | 'create:orders'
  | 'create:profiles'
  | 'manage:own_cards'

  // Permissions Commerciales & Support (Admin)
  | 'view:admin_dashboard'
  | 'manage:users'
  | 'manage:orders'
  | 'manage:products'
  | 'manage:tickets'
  | 'manage:announcements'
  | 'manage:moderation'
  | 'view:analytics_global'

  // Permissions Techniques & Système (Tech)
  | 'view:tech_dashboard'
  | 'manage:system_config'
  | 'manage:audit_logs'
  | 'manage:monitoring'
  | 'manage:impersonation'
  | 'manage:database_maintenance'

/**
 * Matrice associant chaque rôle à la liste exacte de ses permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CLIENT: [
    'view:own_data',
    'edit:own_data',
    'create:orders',
    'create:profiles',
    'manage:own_cards',
  ],

  ADMIN: [
    'view:own_data',
    'edit:own_data',
    'create:orders',
    'create:profiles',
    'manage:own_cards',
    'view:admin_dashboard',
    'manage:users',
    'manage:orders',
    'manage:products',
    'manage:tickets',
    'manage:announcements',
    'manage:moderation',
    'view:analytics_global',
    'manage:audit_logs', // Consultation d'audit pour les admins
  ],

  TECH: [
    'view:own_data',
    'edit:own_data',
    'create:orders',
    'create:profiles',
    'manage:own_cards',
    'view:admin_dashboard',
    'view:tech_dashboard',
    'manage:users',
    'manage:orders',
    'manage:products',
    'manage:tickets',
    'manage:announcements',
    'manage:moderation',
    'view:analytics_global',
    'manage:system_config',
    'manage:audit_logs',
    'manage:monitoring',
    'manage:impersonation',
    'manage:database_maintenance',
  ],
}

/**
 * Vérifie si un rôle possède une permission spécifique
 */
export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role)
  const permissions = ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS.CLIENT
  return permissions.includes(permission)
}

/**
 * Vérifie si un rôle possède TOUTES les permissions demandées
 */
export function hasAllPermissions(role: string | null | undefined, permissions: Permission[]): boolean {
  const normalized = normalizeRole(role)
  const rolePerms = ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS.CLIENT
  return permissions.every(p => rolePerms.includes(p))
}

/**
 * Vérifie si un rôle possède AU MOINS UNE des permissions demandées
 */
export function hasAnyPermission(role: string | null | undefined, permissions: Permission[]): boolean {
  const normalized = normalizeRole(role)
  const rolePerms = ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS.CLIENT
  return permissions.some(p => rolePerms.includes(p))
}
