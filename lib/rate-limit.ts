import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit: number = 5, window: number = 60000) {
  const now = Date.now()
  const windowStart = now - window
  
  const requests = rateLimitMap.get(identifier) || []
  const validRequests = requests.filter((time: number) => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)
  return true
}
