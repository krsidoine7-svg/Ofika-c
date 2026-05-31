import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function ConditionalAnalytics() {
  // Ne charger Analytics et Speed Insights qu'en production
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
