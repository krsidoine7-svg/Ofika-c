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
  title: 'Ofika | Le profil professionnel numérique que tu emmènes partout',
  description: 'Le profil professionnel numérique que tu emmènes partout. La carte NFC et le QR deviennent simplement les moyens d\'accès à l\'identité.',
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
    title: 'Ofika - Le profil professionnel numérique que tu emmènes partout',
    description: 'La carte NFC et le QR deviennent simplement les moyens d\'accès à l\'identité.',
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
    title: 'Ofika - Le profil professionnel numérique que tu emmènes partout',
    description: 'La carte NFC et le QR deviennent simplement les moyens d\'accès à l\'identité.',
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
