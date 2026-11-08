import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'

  // Pages privées, techniques ou de paiement : inutiles (ou nuisibles) dans les moteurs de recherche
  const privatePaths = [
    '/api/',
    '/dashboard/',
    '/admin/',
    '/auth/',
    '/login',
    '/checkout',
    '/payment/',
    '/order/',
    '/subscription/',
    '/contact-preview/',
    '/card/',
    '/cards',
    '/onboarding/card-order',
    '/onboarding/nfc-card',
    '/qr/',   // redirections de QR codes
    '/nfc/',  // redirections de cartes NFC (doublons des profils)
  ]

  return {
    // Tous les robots, y compris ceux des IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…),
    // peuvent lire les pages publiques : c'est ce qui permet à Ofika d'être cité dans leurs réponses.
    rules: [{ userAgent: '*', allow: '/', disallow: privatePaths }],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
