import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNT_SESSION_COOKIE, getAccountSessionUserFromToken } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { CATEGORY_TAXONOMY, TAG_TAXONOMY } from '@/lib/taxonomies'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

type TaxonomyRouteProps = {
  params: Promise<{ id: string }>
}

async function requireUser(request: NextRequest) {
  return getAccountSessionUserFromToken(request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value)
}

async function getTermTaxonomy(id: string) {
  return prisma.contentTermTaxonomy.findUnique({
    where: { id },
    include: {
      term: true,
      articles: {
        select: {
          article: {
            select: {
              id: true,
              category: true,
              tags: true,
            },
          },
        },
      },
    },
  })
}

export async function PATCH(request: NextRequest, { params }: TaxonomyRouteProps) {
  try {
    const accountUser = await requireUser(request)

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

    const { id } = await params
    const existing = await getTermTaxonomy(id)

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Taxonomy term not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const name = String(body.name || '').trim()

    if (!name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'name is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const slug = slugify(String(body.slug || name)) || existing.term.slug
    const oldName = existing.term.name

    const updated = await prisma.contentTermTaxonomy.update({
      where: { id },
      data: {
        description: body.description || null,
        term: {
          update: {
            name,
            slug,
          },
        },
      },
      include: { term: true },
    })

    if (existing.taxonomy === CATEGORY_TAXONOMY) {
      await prisma.article.updateMany({
        where: {
          id: {
            in: existing.articles.map((relationship) => relationship.article.id),
          },
          category: oldName,
        },
        data: { category: name },
      })
    }

    if (existing.taxonomy === TAG_TAXONOMY) {
      await Promise.all(
        existing.articles.map((relationship) => {
          const nextTags = relationship.article.tags.map((tag) =>
            tag.toLowerCase() === oldName.toLowerCase() ? name : tag
          )

          return prisma.article.update({
            where: { id: relationship.article.id },
            data: { tags: Array.from(new Set(nextTags)) },
          })
        })
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: updated.id,
        name: updated.term.name,
        slug: updated.term.slug,
        taxonomy: updated.taxonomy,
        description: updated.description,
        count: updated.count,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating taxonomy:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update taxonomy',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: TaxonomyRouteProps) {
  try {
    const accountUser = await requireUser(request)

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

    const { id } = await params
    const existing = await getTermTaxonomy(id)

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Taxonomy term not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    if (existing.count > 0 || existing.articles.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Only unused taxonomy terms can be deleted',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    await prisma.contentTermTaxonomy.delete({ where: { id } })

    const remainingTaxonomies = await prisma.contentTermTaxonomy.count({
      where: { termId: existing.termId },
    })

    if (remainingTaxonomies === 0) {
      await prisma.contentTerm.delete({ where: { id: existing.termId } })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error deleting taxonomy:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete taxonomy',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
