export type ArticleSection = {
  heading: string
  body: string[]
}

export type BlogArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: string
  featuredImage?: string | null
  sections: ArticleSection[]
}

/**
 * @deprecated Articles are stored in and served dynamically from the PostgreSQL database ("Article" table).
 * Use `db.insight` or Prisma `prisma.article` to query articles.
 * To seed or refresh articles in the database, run: `npm run seed:articles`
 */
export const articles: BlogArticle[] = []

export function getArticle(slug: string): BlogArticle | undefined {
  return articles.find((article) => article.slug === slug)
}
