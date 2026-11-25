import { NextRequest, NextResponse } from 'next/server'
import { getAccountSessionUser } from '@/lib/account-auth'
import { generateApiKey, listUserApiKeys } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/api-keys
 * List all API keys for the authenticated account
 */
export async function GET() {
  const sessionUser = await getAccountSessionUser()
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in to view your API keys.' },
      { status: 401 }
    )
  }

  try {
    const keys = await listUserApiKeys(sessionUser.id)
    return NextResponse.json({
      success: true,
      data: keys,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve API keys'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * POST /api/account/api-keys
 * Issue a new API key for the authenticated account
 */
export async function POST(req: NextRequest) {
  const sessionUser = await getAccountSessionUser()
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in to generate an API key.' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { name, environment = 'live', scopes = ['read', 'write', 'fhir'], expiresInDays = null } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key name is required (e.g. "Hospital EHR Staging Connector")' },
        { status: 400 }
      )
    }

    const result = await generateApiKey({
      userId: sessionUser.id,
      name: name.trim(),
      environment: environment === 'test' ? 'test' : 'live',
      scopes: Array.isArray(scopes) ? scopes : ['read', 'write', 'fhir'],
      expiresInDays: typeof expiresInDays === 'number' ? expiresInDays : null,
    })

    return NextResponse.json({
      success: true,
      message: 'API Key issued successfully. Store your secret key securely; it will not be displayed again.',
      data: {
        secretKey: result.secretKey,
        apiKey: result.apiKey,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to issue API key'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
