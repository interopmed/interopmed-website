import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKeyFromHeaders } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

interface ProxyRequestBody {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

function isSafeUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl)
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }

    const hostname = parsed.hostname.toLowerCase()

    // Block cloud metadata services
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false
    }

    // In production, block private link-local IPv6 and AWS metadata
    if (process.env.NODE_ENV === 'production') {
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        // Only allow localhost if explicitly configured for testing
        if (process.env.ALLOW_LOCAL_FHIR_PROXY !== 'true') {
          return false
        }
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * POST /api/fhir/proxy
 * Live proxy endpoint for querying real FHIR servers and EHR endpoints
 * Solves CORS restrictions and provides latency/header analytics.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // If client supplied an InteropMed API Key, verify it
    const apiKeyAuth = await authenticateApiKeyFromHeaders(req.headers)
    if (apiKeyAuth && !apiKeyAuth.ok) {
      return NextResponse.json(
        { success: false, error: apiKeyAuth.error || 'Invalid or expired API Key' },
        { status: 401 }
      )
    }

    const json: ProxyRequestBody = await req.json()
    const { url, method = 'GET', headers: customHeaders = {}, body } = json

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "url" parameter' },
        { status: 400 }
      )
    }

    if (!isSafeUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Target URL is disallowed or invalid' },
        { status: 400 }
      )
    }

    // Build outbound request headers
    const outgoingHeaders: Record<string, string> = {
      'Accept': 'application/fhir+json, application/json, text/plain, */*',
      'User-Agent': 'InteropMed-EHR-Tester/1.0',
    }

    // Attach custom authorization headers if provided (e.g. Bearer token, Basic auth)
    for (const [key, val] of Object.entries(customHeaders)) {
      if (typeof val === 'string' && val.trim().length > 0) {
        outgoingHeaders[key] = val.trim()
      }
    }

    // Prepare fetch options with 12s timeout
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: outgoingHeaders,
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    }

    if (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' && body) {
      outgoingHeaders['Content-Type'] = 'application/fhir+json'
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    const response = await fetch(url, fetchOptions)
    const latencyMs = Date.now() - startTime

    // Extract relevant response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      if (['content-type', 'date', 'etag', 'last-modified', 'location', 'x-request-id'].includes(key.toLowerCase())) {
        responseHeaders[key.toLowerCase()] = value
      }
    })

    const contentType = response.headers.get('content-type') || ''
    let responseData: unknown = null

    if (contentType.includes('json') || contentType.includes('fhir')) {
      try {
        responseData = await response.json()
      } catch {
        responseData = await response.text()
      }
    } else {
      responseData = await response.text()
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs,
      headers: responseHeaders,
      data: responseData,
    })
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown network error'

    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError' || errorMessage.includes('timeout'))

    return NextResponse.json(
      {
        success: false,
        status: isTimeout ? 504 : 502,
        statusText: isTimeout ? 'Gateway Timeout' : 'Bad Gateway',
        latencyMs,
        error: isTimeout
          ? 'The target EHR / FHIR server did not respond within 12 seconds.'
          : `Failed to reach target server: ${errorMessage}`,
      },
      { status: isTimeout ? 504 : 502 }
    )
  }
}
