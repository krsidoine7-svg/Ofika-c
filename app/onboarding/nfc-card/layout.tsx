import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commander ma Carte NFC | OFIKA',
  description: 'Personnalisez et commandez votre carte de visite connectée NFC haut de gamme avec gravure sur-mesure et livraison offerte à Abidjan.',
  alternates: { canonical: '/onboarding/nfc-card' },
  robots: { index: false, follow: true },
}

export default function NFCCardOnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
