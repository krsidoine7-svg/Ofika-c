import { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'

// Régénéré au plus toutes les heures
export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages publiques du site (les pages privées et de paiement sont exclues, voir robots.ts)
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/get-started`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/onboarding/public-page`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Profils publics et actifs : chaque client gagne en visibilité sur Google
  let profilePages: MetadataRoute.Sitemap = []
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('profiles')
      .select('username, custom_url, updated_at')
      .eq('is_public', true)
      .eq('is_active', true)
      .limit(5000)

    const seen = new Set<string>()
    profilePages = (data || [])
      .map((p: any) => ({ slug: p.custom_url || p.username, updated: p.updated_at }))
      .filter((p) => p.slug && !seen.has(p.slug) && seen.add(p.slug))
      .map((p) => ({
        url: `${BASE_URL}/${encodeURIComponent(p.slug)}`,
        lastModified: p.updated ? new Date(p.updated) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch (error) {
    console.error('Sitemap : impossible de charger les profils publics', error)
  }

  return [...staticPages, ...profilePages]
}
