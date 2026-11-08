import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commencer avec Ofika | Carte NFC ou page publique gratuite',
  description:
    "Choisissez votre formule : la carte de visite NFC Ofika (achat unique) ou votre page professionnelle publique gratuite. Partagez vos coordonnées d'un simple geste.",
  alternates: { canonical: '/get-started' },
}

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return children
}
