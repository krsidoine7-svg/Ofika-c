/**
 * Demande la mise à jour immédiate de la page publique d'un profil
 * (à appeler côté navigateur après chaque enregistrement réussi).
 * Ne bloque jamais l'interface : en cas d'échec, la page se mettra à jour d'elle-même (cache 1 h).
 */
export function refreshPublicProfile(profileId?: string | null): void {
  if (!profileId || typeof window === 'undefined') return
  fetch(`/api/profiles/${profileId}/revalidate`, { method: 'POST' }).catch(() => {})
}
