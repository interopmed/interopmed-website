import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getArticleAuthorName } from '@/lib/article-author'
import { articles } from '@/lib/articles'
import { db } from '@/lib/db'

export const metadata = {
  title: 'Articles & Guides | InteropMed',
  description: 'Evidence-based articles and guides on clinical informatics, healthcare data standards, EMR workflows, and hospital technology implementation.',
}

export const dynamic = 'force-dynamic'

type ArticleCard = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: string
  featuredImage?: string | null
}

function formatDate(value: Date | string | null) {
  if (!value) return 'Recent'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

async function getPublishedArticles(): Promise<ArticleCard[]> {
  try {
    const dbArticles = await db.insight.findMany({ status: 'published' })
    const dbMapped: ArticleCard[] = dbArticles.map((item) => ({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt || item.content.slice(0, 180),
      category: item.category,
      author: getArticleAuthorName(item),
      publishedAt: formatDate(item.publishedAt || item.createdAt),
      readingTime: getReadingTime(item.content),
      featuredImage: item.featuredImage,
    }))

    const staticMapped: ArticleCard[] = articles.filter(
      (a) => !dbMapped.some((d) => d.slug === a.slug)
    ).map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      author: a.author,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
      featuredImage: a.featuredImage,
    }))

    return [...dbMapped, ...staticMapped]
  } catch {
    return articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      author: a.author,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
      featuredImage: a.featuredImage,
    }))
  }
}

export default async function ArticlesPage() {
  const allArticles = await getPublishedArticles()
  const featured = allArticles[0]
  const remaining = allArticles.slice(1)

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfdfd] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-slate-200/70 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                Articles & Guides
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Health Informatics & Standards Library
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Clear, evidence-based articles for doctors, nurses, informaticians, researchers, and health tech developers.
              </p>

              {/* Topic Hub Links */}
              <div className="mt-8 flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Topic Hubs:</span>
                <Link
                  href="/clinical-informatics"
                  className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400"
                >
                  Clinical Informatics →
                </Link>
                <Link
                  href="/interoperability"
                  className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400"
                >
                  Interoperability & Standards →
                </Link>
                <Link
                  href="/implementation"
                  className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400"
                >
                  Implementation & Strategy →
                </Link>
                <Link
                  href="/ehr-lis"
                  className="rounded-lg border border-teal-200/80 bg-teal-50/50 px-3.5 py-1.5 text-xs font-medium text-teal-800 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300"
                >
                  EHR & LIS Explorer →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featured && (
          <section className="py-10">
            <div className="mx-auto max-w-7xl px-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900 md:p-10">
                <div className="lg:grid lg:grid-cols-[1.3fr_0.7fr] lg:gap-10 lg:items-center">
                  <div>
                    <span className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                      {featured.category}
                    </span>
                    <h2 className="mt-4 text-2xl font-bold leading-snug text-slate-950 dark:text-white sm:text-3xl">
                      <Link href={`/articles/${featured.slug}`} className="transition hover:text-teal-700 dark:hover:text-teal-400">
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                      {featured.excerpt}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{featured.author}</span>
                      <span>•</span>
                      <span>{featured.publishedAt}</span>
                      <span>•</span>
                      <span>{featured.readingTime}</span>
                    </div>
                  </div>
                  <div className="mt-6 lg:mt-0 flex flex-col items-start lg:items-end justify-center">
                    <Link
                      href={`/articles/${featured.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-xs font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
                    >
                      Read article
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section className="pb-16 pt-2">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">All Articles</h2>
              <span className="text-xs font-medium text-slate-400">{allArticles.length} guides</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remaining.map((article) => (
                <article
                  key={article.slug}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        {article.category}
                      </span>
                      <span className="text-slate-400">{article.readingTime}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold leading-snug text-slate-950 dark:text-white">
                      <Link href={`/articles/${article.slug}`} className="transition hover:text-teal-700 dark:hover:text-teal-400">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-300">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-3.5 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{article.author}</span>
                    <span>{article.publishedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
