import { Metadata } from 'next'
import { getPublicProfile } from '@/lib/services/public-profile'
import ProfileClient from './ProfileClient'

type Props = {
  params: { username: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const username = params.username
  const profile = await getPublicProfile(username)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'

  if (profile) {
    const title = `${profile.full_name || profile.profile_name} | Ofika`
    const description = profile.bio || `Découvrez le profil de ${profile.full_name || profile.profile_name} sur Ofika.`
    const imageUrl = profile.image_url || `${baseUrl}/assets/logos/logo-orange.svg`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{
          url: imageUrl,
          width: 800,
          height: 600,
          alt: profile.full_name || profile.profile_name,
        }],
        type: 'profile',
        url: `${baseUrl}/${username}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    }
  }

  return {
    title: 'Profil non trouvé | Ofika',
  }
}

export default async function Page({ params }: Props) {
  const profile = await getPublicProfile(params.username)

  return <ProfileClient initialProfile={profile} />
}