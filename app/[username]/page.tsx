import { Metadata } from 'next'
import { getPublicProfile } from '@/lib/services/public-profile'
import ProfileClient from './ProfileClient'

// Mise en cache intelligente de 60 secondes pour chargement ultra-rapide (<50ms)
export const revalidate = 60

type Props = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'

/** Adresse publique officielle d'un profil (custom_url prioritaire, sinon username) */
function profileSlug(profile: any, fallback: string): string {
  return profile?.custom_url || profile?.username || fallback
}

function profileDescription(profile: any): string {
  const name = profile.full_name || profile.profile_name
  if (profile.bio) return String(profile.bio).slice(0, 200)
  const role = [profile.job_title, profile.company].filter(Boolean).join(' · ')
  return role
    ? `${name} — ${role}. Enregistrez son contact en 1 seconde avec Ofika.`
    : `Découvrez le profil de ${name} sur Ofika et enregistrez son contact en 1 seconde.`
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfile(username)

  if (profile) {
    const name = profile.full_name || profile.profile_name
    const title = `${name} | Ofika`
    const description = profileDescription(profile)
    const url = `/${profileSlug(profile, username)}`

    // L'image de partage est générée par ./opengraph-image.tsx (photo + nom, PNG 1200×630)
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, type: 'profile', url, siteName: 'Ofika', locale: 'fr_CI' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  return {
    title: 'Profil non trouvé | Ofika',
    robots: { index: false, follow: false },
  }
}

/** Données structurées schema.org (ProfilePage + Person) : uniquement les infos déjà publiques sur la page */
function profileStructuredData(profile: any, slug: string) {
  const url = `${BASE_URL}/${slug}`
  const sameAs = (Array.isArray(profile.social_links) ? profile.social_links : [])
    .filter((l: any) => l?.url && l.is_active !== false && /^https?:\/\//.test(l.url))
    .map((l: any) => l.url)
  const person: Record<string, unknown> = {
    '@type': 'Person',
    name: profile.full_name || profile.profile_name,
    url,
  }
  if (profile.job_title) person.jobTitle = profile.job_title
  if (profile.company) person.worksFor = { '@type': 'Organization', name: profile.company }
  if (profile.image_url && /^https?:\/\//.test(profile.image_url)) person.image = profile.image_url
  if (profile.location) person.address = { '@type': 'PostalAddress', addressLocality: profile.location }
  if (sameAs.length) person.sameAs = sameAs
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    inLanguage: 'fr-CI',
    mainEntity: person,
  }
}

export default async function Page({ params }: Props) {
  const { username } = await params
  const profile = await getPublicProfile(username)

  return (
    <>
      {profile && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // échappe « < » pour qu'aucun texte saisi par l'utilisateur ne puisse fermer la balise script
            __html: JSON.stringify(profileStructuredData(profile, profileSlug(profile, username))).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <ProfileClient initialProfile={profile} />
    </>
  )
}
