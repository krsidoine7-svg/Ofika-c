import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inter } from 'next/font/google'
import { ConditionalAnalytics } from '@/components/Analytics'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { AuthProvider } from '@/lib/context/AuthContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'),
  title: 'Ofika - Le lien en bio et la carte NFC des créatifs',
  description: 'Partagez tous vos réseaux et contacts avec une simple carte NFC ou un lien en bio. La meilleure alternative à Linktree, Beacons et Lnk.Bio conçue spécifiquement pour les créatifs et professionnels.',
  generator: 'v0.app',
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
    icon: '/assets/logos/logo-black.svg',
    apple: '/assets/logos/logo-black.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ofika.ci/',
    title: 'Ofika - Le Link in Bio ultime pour les Créatifs & Carte NFC',
    description: 'Centralisez votre portfolio, réseaux sociaux et contacts. L\'alternative parfaite à Linktree et Beacons pour booster votre visibilité.',
    siteName: 'Ofika',
    images: [
      {
        url: '/assets/logos/logo-black.svg', // Remplacer ultérieurement par une belle image de couverture 1200x630
        width: 1200,
        height: 630,
        alt: 'Bannière Ofika Link in Bio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ofika - Le lien en bio des créatifs',
    description: 'Centralisez vos liens et partagez vos contacts avec la technologie NFC. Ofika est la plateforme des créatifs.',
    images: ['/assets/logos/logo-black.svg'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
            />
            <ConditionalAnalytics />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
