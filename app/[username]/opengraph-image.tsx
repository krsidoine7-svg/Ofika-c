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
  
  // Supporte les images distantes valides (PNG, JPEG, WebP, GIF, Supabase Storage, Google, etc.)
  const isSupportedImage = (url: unknown): url is string => {
    if (typeof url !== 'string' || !url.startsWith('http')) return false
    if (url.toLowerCase().includes('.svg')) return false
    return (
      /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url) ||
      url.includes('/storage/v1/object/public/') ||
      url.includes('googleusercontent.com') ||
      url.includes('githubusercontent.com')
    )
  }
  const photo = isSupportedImage(profile?.image_url) ? profile.image_url : null
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
          position: 'relative',
        }}
      >
        {/* Badge de marque officiel en haut à droite */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '10px 22px',
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FF6600',
            }}
          />
          <span>OFIKA · CARTE NFC</span>
        </div>

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
