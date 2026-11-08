'use client'

import { useMemo, type ComponentType } from 'react'
import { LinkInBioEditorial } from './templates/LinkInBioEditorial'
import { LinkInBioCarte } from './templates/LinkInBioCarte'
import { LinkInBioBento } from './templates/LinkInBioBento'
import { LinkInBioNoirLuxe } from './templates/LinkInBioNoirLuxe'
import { LinkInBioImmersif } from './templates/LinkInBioImmersif'
import { LinkInBioBoutique } from './templates/LinkInBioBoutique'
import { LinkInBioOrganique } from './templates/LinkInBioOrganique'
import { LinkInBioSuisse } from './templates/LinkInBioSuisse'
import { isCurrentTemplate, resolveTemplateId, type TemplateId } from '@/lib/templates/registry'

const COMPONENTS: Record<TemplateId, ComponentType<any>> = {
  editorial: LinkInBioEditorial,
  carte: LinkInBioCarte,
  bento: LinkInBioBento,
  noir_luxe: LinkInBioNoirLuxe,
  immersif: LinkInBioImmersif,
  boutique: LinkInBioBoutique,
  organique: LinkInBioOrganique,
  suisse: LinkInBioSuisse,
}

interface ProfileTemplateRendererProps {
  profile: any
  isPreview?: boolean
  showAddToContacts?: boolean
  /** Force un template (aperçus des sélecteurs) au lieu de profile.design_choice */
  designId?: string
}

/**
 * Affiche le bon template pour un profil.
 * Les anciens identifiants (design1, premium, cjcd…) basculent vers le nouveau template le plus proche ;
 * leurs couleurs personnalisées sont alors ignorées, car elles n'ont pas le même rôle dans le nouveau design.
 */
export function ProfileTemplateRenderer({ profile, isPreview = false, showAddToContacts = true, designId }: ProfileTemplateRendererProps) {
  const requested = designId ?? profile?.design_choice
  const Component = COMPONENTS[resolveTemplateId(requested)]

  const effectiveProfile = useMemo(() => {
    if (isCurrentTemplate(requested) || !profile?.theme_settings) return profile
    const { primary_color: _p, secondary_color: _s, palette_id: _id, ...rest } = profile.theme_settings
    return { ...profile, theme_settings: rest }
  }, [profile, requested])

  return <Component profile={effectiveProfile} isPreview={isPreview} showAddToContacts={showAddToContacts} />
}
