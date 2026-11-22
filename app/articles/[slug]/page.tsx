import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getArticleAuthorName } from '@/lib/article-author'
import { articles, getArticle } from '@/lib/articles'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

type ArticleDetail = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: string
  sections: {
    heading: string
    body: string[]
  }[]
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

async function getArticleData(slug: string): Promise<ArticleDetail | null> {
  try {
    const dbItem = await db.insight.findPublishedBySlug(slug)
    if (dbItem) {
      return {
        slug: dbItem.slug,
        title: dbItem.title,
        excerpt: dbItem.excerpt || dbItem.content.slice(0, 180),
        category: dbItem.category,
        author: getArticleAuthorName(dbItem),
        publishedAt: formatDate(dbItem.publishedAt || dbItem.createdAt),
        readingTime: getReadingTime(dbItem.content),
        sections: [
          {
            heading: 'Overview & Analysis',
            body: dbItem.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
          },
        ],
      }
    }
  } catch {
    // fallback to static
  }

  const staticArticle = getArticle(slug)
  if (staticArticle) {
    return {
      slug: staticArticle.slug,
      title: staticArticle.title,
      excerpt: staticArticle.excerpt,
      category: staticArticle.category,
      author: staticArticle.author,
      publishedAt: staticArticle.publishedAt,
      readingTime: staticArticle.readingTime,
      sections: staticArticle.sections,
    }
  }

  return null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleData(slug)

  if (!article) {
    return {
      title: 'Article Not Found | InteropMed',
    }
  }

  return {
    title: `${article.title} | InteropMed`,
    description: article.excerpt,
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleData(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Article Header */}
        <header className="border-b border-slate-200 bg-slate-50/60 py-12 dark:border-slate-800 dark:bg-slate-900/40 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Articles
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {article.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{article.readingTime}</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
              {article.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              {article.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Author:</span> {article.author}
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Published:</span> {article.publishedAt}
              </div>
            </div>
          </div>
        </header>

        {/* Article Body with Table of Contents */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-6 lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
            {/* Main content */}
            <article className="prose prose-slate max-w-none dark:prose-invert">
              {article.sections.map((section, idx) => (
                <div key={idx} id={`section-${idx}`} className="mb-10">
                  <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">
                    {section.heading}
                  </h2>
                  <div className="space-y-4 text-base leading-8 text-slate-700 dark:text-slate-300">
                    {section.body.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </article>

            {/* Sidebar with Table of Contents & Navigation */}
            <aside className="mt-12 lg:mt-0">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contents
                  </p>
                  <nav className="mt-3 space-y-2 text-sm">
                    {article.sections.map((section, idx) => (
                      <a
                        key={idx}
                        href={`#section-${idx}`}
                        className="block text-slate-600 transition hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
                      >
                        {section.heading}
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 dark:border-teal-900/60 dark:bg-teal-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Interactive Learning
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Explore clinical workflows and standards interactively with InteropMind.
                  </p>
                  <Link
                    href="/interopmind"
                    className="mt-3 inline-block rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    Open InteropMind
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-8 text-xl font-bold text-slate-950 dark:text-white">Related Reading</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((rel) => (
                  <article
                    key={rel.slug}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div>
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{rel.category}</span>
                      <h3 className="mt-2 text-base font-bold text-slate-950 dark:text-white">
                        <Link href={`/articles/${rel.slug}`} className="hover:text-teal-600 dark:hover:text-teal-400">
                          {rel.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-2 dark:text-slate-400">{rel.excerpt}</p>
                    </div>
                    <span className="mt-4 text-[11px] text-slate-400">{rel.readingTime}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
