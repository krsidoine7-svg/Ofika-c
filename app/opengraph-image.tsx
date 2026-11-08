import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Image de partage par défaut du site (Facebook, WhatsApp, TikTok, LinkedIn…) : PNG 1200×630
export const alt = "Ofika — Carte de visite NFC et profil pro digital en Côte d'Ivoire"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), 'public/assets/logos/logo-orange-full.svg'))
  const logoSrc = `data:image/svg+xml;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 90px',
          background: 'radial-gradient(circle at 78% 40%, #4a2108 0%, #0b0b0c 58%)',
          color: '#ffffff',
        }}
      >
        <img src={logoSrc} width={300} height={140} style={{ objectFit: 'contain', marginLeft: -6 }} />
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34, fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
          <span>Partagez vos coordonnées</span>
          <span style={{ display: 'flex', marginTop: 10 }}>
            <span style={{ background: '#FF6600', borderRadius: 18, padding: '2px 22px 10px' }}>d'un simple geste</span>
          </span>
        </div>
        <div style={{ display: 'flex', marginTop: 34, fontSize: 28, color: 'rgba(255,255,255,0.72)' }}>
          Carte NFC · QR code · Profil gratuit · Sans application
        </div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 28, fontWeight: 700, color: '#FF6600' }}>ofika.ci</div>
      </div>
    ),
    size,
  )
}
