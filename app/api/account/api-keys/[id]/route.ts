import { NextRequest, NextResponse } from 'next/server'
import { getAccountSessionUser } from '@/lib/account-auth'
import { revokeUserApiKey, deleteUserApiKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/account/api-keys/[id]
 * Revoke or permanently delete an API key
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const sessionUser = await getAccountSessionUser()
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    )
  }

  const { id } = await context.params
  const url = new URL(req.url)
  const permanent = url.searchParams.get('permanent') === 'true'

  try {
    const success = permanent
      ? await deleteUserApiKey(id, sessionUser.id)
      : await revokeUserApiKey(id, sessionUser.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'API key not found or not owned by your account.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'API key deleted permanently.' : 'API key revoked successfully.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revoke API key'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
