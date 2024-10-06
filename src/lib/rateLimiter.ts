import { NextRequest, NextResponse } from 'next/server'
import { AppError } from './errorUtils'

const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimiter(req: NextRequest) {
  const ip = req.ip || 'unknown'
  const now = Date.now()

  let requestData = ipRequestCounts.get(ip)

  if (!requestData || now > requestData.resetTime) {
    requestData = { count: 1, resetTime: now + WINDOW_SIZE }
    ipRequestCounts.set(ip, requestData)
  } else {
    requestData.count++
    if (requestData.count > MAX_REQUESTS) {
      throw new AppError('Too many requests', 429)
    }
  }
}
