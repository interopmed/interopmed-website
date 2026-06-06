import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNT_SESSION_COOKIE, getAccountSessionUserFromToken } from '@/lib/account-auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { normalizeTerms, syncArticleTaxonomies } from '@/lib/taxonomies'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

type InsightRouteProps = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: InsightRouteProps) {
  try {
    const accountUser = await getAccountSessionUserFromToken(
      request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    )

    if (!accountUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Account login is required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    if (accountUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Admin access is required',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    const { id } = await params
    const existing = await db.prisma.article.findFirst({
      where: {
        id,
        type: 'insight',
      },
    })

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Insight not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const title = String(body.title || '').trim()
    const content = String(body.content || '').trim()
    const category = String(body.category || 'interoperability').trim() || 'interoperability'
    const tags = normalizeTerms(body.tags)

    if (!title || !content) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'title and content are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const status = body.status === 'published' ? 'published' : 'draft'
    const nextSlug = slugify(String(body.slug || title)) || existing.slug
    const slugOwner = await db.prisma.article.findUnique({ where: { slug: nextSlug } })

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Another insight already uses that slug',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    const insight = await db.prisma.article.update({
      where: { id },
      data: {
        title,
        slug: nextSlug,
        excerpt: body.excerpt || null,
        content,
        category,
        tags,
        featuredImage: body.featuredImage || null,
        metaDescription: body.metaDescription || body.excerpt || null,
        metaKeywords: normalizeTerms(body.metaKeywords),
        status,
        publishedAt:
          status === 'published'
            ? existing.publishedAt || new Date()
            : null,
      },
      include: {
        author: true,
        accountAuthor: true,
      },
    })

    await syncArticleTaxonomies({
      articleId: insight.id,
      category,
      tags,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: insight,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating insight:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update insight',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
