import { Analytics } from '@vercel/analytics/next'

export function ConditionalAnalytics() {
  // Ne charger Analytics qu'en production
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return <Analytics />
}
