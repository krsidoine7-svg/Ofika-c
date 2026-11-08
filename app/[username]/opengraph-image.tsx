import { ImageResponse } from 'next/og'
import { getPublicProfile } from '@/lib/services/public-profile'

// Image de partage d'un profil public (WhatsApp, Facebook…) : photo + nom + métier, PNG 1200×630
export const alt = 'Profil Ofika'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function ProfileOgImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile: any = await getPublicProfile(username)

  const name: string = profile?.full_name || profile?.profile_name || 'Profil Ofika'
  const role = [profile?.job_title, profile?.company].filter(Boolean).join(' · ')
  const slug = profile?.custom_url || profile?.username || username
  const initials = name.split(/\s+/).slice(0, 2).map((p: string) => p.charAt(0).toUpperCase()).join('')
  // Le moteur d'image ne lit que le PNG / JPEG / GIF distants
  const photo = typeof profile?.image_url === 'string' && /^https?:\/\/.+\.(png|jpe?g|gif)(\?.*)?$/i.test(profile.image_url)
    ? profile.image_url
    : null
  const nameSize = name.length > 22 ? 58 : 72

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 90px',
          gap: 64,
          background: 'radial-gradient(circle at 20% 50%, #3b1a07 0%, #0b0b0c 60%)',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            width: 330,
            height: 330,
            borderRadius: 40,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1c1c1f',
            border: '4px solid #FF6600',
            flexShrink: 0,
          }}
        >
          {photo ? (
            <img src={photo} width={330} height={330} style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 130, fontWeight: 800, color: '#FF6600' }}>{initials}</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: nameSize, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{name}</div>
          {role && <div style={{ display: 'flex', marginTop: 18, fontSize: 32, color: 'rgba(255,255,255,0.75)' }}>{role}</div>}
          <div style={{ display: 'flex', marginTop: 40, fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>
            Enregistrez mon contact en 1 seconde
          </div>
          <div style={{ display: 'flex', marginTop: 10, fontSize: 32, fontWeight: 700, color: '#FF6600' }}>ofika.ci/{slug}</div>
        </div>
      </div>
    ),
    size,
  )
}
