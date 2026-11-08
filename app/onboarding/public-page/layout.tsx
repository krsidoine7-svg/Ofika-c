import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer ma carte de visite digitale gratuite | Ofika',
  description:
    'Créez gratuitement votre profil professionnel Ofika en 2 minutes : numéro, WhatsApp, réseaux sociaux et 8 designs premium. Sans application.',
  alternates: { canonical: '/onboarding/public-page' },
}

export default function PublicPageOnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
