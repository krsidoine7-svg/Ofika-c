import type { NextRequest } from 'next/server'

/**
 * Extrait l'IP client depuis les en-têtes (compatible Next.js 15+).
 */
export function getRequestClientIp(request: NextRequest | Request): string {
  const headers = request.headers
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return 'unknown'
}
