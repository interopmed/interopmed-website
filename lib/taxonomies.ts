import { prisma } from './prisma'
import { slugify } from './slugify'

export const CATEGORY_TAXONOMY = 'category'
export const TAG_TAXONOMY = 'post_tag'

export type TaxonomyName = typeof CATEGORY_TAXONOMY | typeof TAG_TAXONOMY

export type TaxonomyOption = {
  id: string
  name: string
  slug: string
  taxonomy: string
  count: number
}

type PrismaWithTaxonomies = typeof prisma & {
  contentTerm: typeof prisma.contentTerm
  contentTermTaxonomy: typeof prisma.contentTermTaxonomy
  articleTermRelationship: typeof prisma.articleTermRelationship
}

function normalizeTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function hasTaxonomyDelegates(client: typeof prisma): client is PrismaWithTaxonomies {
  return Boolean(
    client.contentTerm &&
      client.contentTermTaxonomy &&
      client.articleTermRelationship
  )
}

export function normalizeTerms(values: unknown) {
  if (!Array.isArray(values)) {
    return []
  }

  const seen = new Set<string>()

  return values
    .map((value) => normalizeTerm(String(value || '')))
    .filter((value) => {
      const key = value.toLowerCase()

      if (!value || seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

async function ensureTermTaxonomy(name: string, taxonomy: TaxonomyName) {
  if (!hasTaxonomyDelegates(prisma)) {
    throw new Error('Prisma taxonomy models are not available. Restart the dev server after running prisma generate.')
  }

  const normalizedName = normalizeTerm(name)
  const slug = slugify(normalizedName) || `term-${Date.now()}`
  const term = await prisma.contentTerm.upsert({
    where: { slug },
    update: { name: normalizedName },
    create: {
      name: normalizedName,
      slug,
    },
  })

  return prisma.contentTermTaxonomy.upsert({
    where: {
      termId_taxonomy: {
        termId: term.id,
        taxonomy,
      },
    },
    update: {},
    create: {
      termId: term.id,
      taxonomy,
    },
    include: {
      term: true,
    },
  })
}

async function refreshTermCounts(termTaxonomyIds: string[]) {
  if (!hasTaxonomyDelegates(prisma)) {
    return
  }

  const uniqueIds = Array.from(new Set(termTaxonomyIds)).filter(Boolean)

  await Promise.all(
    uniqueIds.map(async (id) => {
      const count = await prisma.articleTermRelationship.count({
        where: { termTaxonomyId: id },
      })

      await prisma.contentTermTaxonomy.update({
        where: { id },
        data: { count },
      })
    })
  )
}

export async function syncArticleTaxonomies({
  articleId,
  category,
  tags,
}: {
  articleId: string
  category: string
  tags: string[]
}) {
  if (!hasTaxonomyDelegates(prisma)) {
    return
  }

  const existingRelationships = await prisma.articleTermRelationship.findMany({
    where: { articleId },
    select: { termTaxonomyId: true },
  })
  const previousTermTaxonomyIds = existingRelationships.map((relationship) => relationship.termTaxonomyId)
  const categoryTerm = await ensureTermTaxonomy(category || 'interoperability', CATEGORY_TAXONOMY)
  const tagTerms = await Promise.all(
    normalizeTerms(tags).map((tag) => ensureTermTaxonomy(tag, TAG_TAXONOMY))
  )
  const nextTerms = [categoryTerm, ...tagTerms]

  await prisma.articleTermRelationship.deleteMany({
    where: { articleId },
  })

  await prisma.articleTermRelationship.createMany({
    data: nextTerms.map((term, index) => ({
      articleId,
      termTaxonomyId: term.id,
      termOrder: index,
    })),
    skipDuplicates: true,
  })

  await refreshTermCounts([
    ...previousTermTaxonomyIds,
    ...nextTerms.map((term) => term.id),
  ])
}

export async function getInsightTaxonomyOptions(): Promise<{
  categories: string[]
  tags: string[]
  terms: TaxonomyOption[]
}> {
  try {
    const taxonomies = await prisma.$queryRaw<TaxonomyOption[]>`
      SELECT
        taxonomy."id",
        term."name",
        term."slug",
        taxonomy."taxonomy",
        taxonomy."count"
      FROM "ContentTermTaxonomy" taxonomy
      INNER JOIN "ContentTerm" term ON term."id" = taxonomy."termId"
      ORDER BY taxonomy."taxonomy" ASC, term."name" ASC
    `

    return {
      categories: taxonomies
        .filter((taxonomy) => taxonomy.taxonomy === CATEGORY_TAXONOMY)
        .map((taxonomy) => taxonomy.name),
      tags: taxonomies
        .filter((taxonomy) => taxonomy.taxonomy === TAG_TAXONOMY)
        .map((taxonomy) => taxonomy.name),
      terms: taxonomies,
    }
  } catch (error) {
    console.error('Error loading taxonomy tables, falling back to article fields:', error)
    const articles = await prisma.article.findMany({
      where: { type: 'insight' },
      select: {
        category: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    const categories = new Set<string>()
    const tags = new Set<string>()

    articles.forEach((article) => {
      if (article.category) {
        categories.add(article.category)
      }

      article.tags.forEach((tag) => {
        if (tag) {
          tags.add(tag)
        }
      })
    })

    return {
      categories: Array.from(categories).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
      terms: [],
    }
  }
}
