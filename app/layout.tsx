import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inter } from 'next/font/google'
import { ConditionalAnalytics } from '@/components/Analytics'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { AuthProvider } from '@/lib/context/AuthContext'
import { PwaRegister } from '@/components/PwaRegister'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { NFC_CARD_BASE_PRICE } from '@/lib/config/pricing'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#FF6600',
  width: 'device-width',
  initialScale: 1,
  // Pas de maximumScale : laisser zoomer est requis pour l'accessibilité
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'
const SITE_TITLE = "Ofika | Carte de visite NFC et profil pro digital en Côte d'Ivoire"
const SITE_DESCRIPTION =
  "Partagez vos coordonnées d'un simple geste : carte de visite NFC et QR code. Numéro, WhatsApp et réseaux enregistrés en 1 seconde, sans application. Profil gratuit."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: 'Ofika',
  keywords: [
    'carte de visite NFC', 'carte de visite digitale', 'carte de visite Abidjan', "carte NFC Côte d'Ivoire",
    'QR code carte de visite', 'profil professionnel', 'link in bio', 'Ofika',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ofika',
  },
  other: {
    'mobile-web-app-capable': 'yes'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/logos/logo-orange.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // L'image de partage vient de app/opengraph-image.tsx (PNG 1200×630 généré)
  openGraph: {
    type: 'website',
    locale: 'fr_CI',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Ofika',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // Pas de « canonical » ici : il serait hérité par TOUTES les pages (profils compris).
  // Chaque page déclare sa propre adresse canonique.
}

// Données structurées (schema.org) : qui est Ofika et ce qu'elle vend
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Ofika',
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      slogan: 'Tout est là.',
      description: SITE_DESCRIPTION,
      areaServed: { '@type': 'Country', name: "Côte d'Ivoire" },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Ofika',
      inLanguage: 'fr-CI',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Product',
      '@id': `${SITE_URL}/#carte-nfc`,
      name: 'Carte de visite NFC Ofika',
      description:
        "Carte de visite sans contact : approchée d'un smartphone, elle ouvre votre profil Ofika. Achat unique, utilisable à vie. QR code inclus.",
      brand: { '@id': `${SITE_URL}/#organization` },
      image: `${SITE_URL}/opengraph-image`,
      offers: {
        '@type': 'Offer',
        price: NFC_CARD_BASE_PRICE,
        priceCurrency: 'XOF',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/get-started`,
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr-CI">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <QueryProvider>
          <AuthProvider>
            <OfflineBanner />
            {children}
            <Toaster
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
            />
            <ConditionalAnalytics />
            <PwaRegister />
            <PwaInstallPrompt />
            <CookieBanner />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
