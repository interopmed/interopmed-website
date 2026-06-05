import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNT_SESSION_COOKIE, getAccountSessionUserFromToken } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { CATEGORY_TAXONOMY, TAG_TAXONOMY } from '@/lib/taxonomies'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

function normalizeTaxonomy(value: unknown) {
  return value === TAG_TAXONOMY ? TAG_TAXONOMY : CATEGORY_TAXONOMY
}

async function requireUser(request: NextRequest) {
  return getAccountSessionUserFromToken(request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value)
}

export async function GET() {
  try {
    const terms = await prisma.$queryRaw<
      {
        id: string
        name: string
        slug: string
        taxonomy: string
        description: string | null
        count: number
      }[]
    >`
      SELECT
        taxonomy."id",
        term."name",
        term."slug",
        taxonomy."taxonomy",
        taxonomy."description",
        taxonomy."count"
      FROM "ContentTermTaxonomy" taxonomy
      INNER JOIN "ContentTerm" term ON term."id" = taxonomy."termId"
      ORDER BY taxonomy."taxonomy" ASC, term."name" ASC
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: terms,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error loading taxonomies:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to load taxonomies',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const name = String(body.name || '').trim()
    const taxonomy = normalizeTaxonomy(body.taxonomy)

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

    const slug = slugify(String(body.slug || name)) || `term-${Date.now()}`
    const term = await prisma.contentTerm.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    })
    const termTaxonomy = await prisma.contentTermTaxonomy.upsert({
      where: {
        termId_taxonomy: {
          termId: term.id,
          taxonomy,
        },
      },
      update: {
        description: body.description || null,
      },
      create: {
        termId: term.id,
        taxonomy,
        description: body.description || null,
      },
      include: { term: true },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: termTaxonomy.id,
          name: termTaxonomy.term.name,
          slug: termTaxonomy.term.slug,
          taxonomy: termTaxonomy.taxonomy,
          description: termTaxonomy.description,
          count: termTaxonomy.count,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating taxonomy:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create taxonomy',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
