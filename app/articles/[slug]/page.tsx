import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getArticleAuthorName } from '@/lib/article-author'
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

function parseContentIntoSections(content: string, fallbackTitle = 'Overview & Analysis') {
  const rawSections = content.split(/\n(?=##\s+)/)
  if (rawSections.length > 1) {
    return rawSections.map((sec) => {
      const lines = sec.trim().split('\n')
      const firstLine = lines[0].trim()
      const heading = firstLine.startsWith('## ') ? firstLine.replace(/^##\s+/, '') : fallbackTitle
      const bodyText = firstLine.startsWith('## ') ? lines.slice(1).join('\n') : sec
      const body = bodyText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      return { heading, body }
    })
  }
  return [
    {
      heading: fallbackTitle,
      body: content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    },
  ]
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
        sections: parseContentIntoSections(dbItem.content, dbItem.title),
      }
    }
  } catch (error) {
    console.error('Error fetching article from database:', error)
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

  let relatedArticles: {
    slug: string
    title: string
    excerpt: string
    category: string
    author: string
    readingTime: string
  }[] = []

  try {
    const allDbArticles = await db.insight.findMany({ status: 'published' })
    relatedArticles = allDbArticles
      .filter((a) => a.slug !== article.slug)
      .slice(0, 3)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || a.content.slice(0, 180),
        category: a.category,
        author: getArticleAuthorName(a),
        readingTime: getReadingTime(a.content),
      }))
  } catch (error) {
    console.error('Error fetching related articles:', error)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Article Header */}
        <header className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800 dark:bg-slate-950 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 transition hover:text-teal-800 dark:text-teal-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Articles
                </Link>

                <div className="mt-5 flex items-center gap-3">
                  <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{article.readingTime}</span>
                </div>

                <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl lg:text-[2.6rem] lg:leading-[1.2]">
                  {article.title}
                </h1>

                <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
                  {article.excerpt}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Author:</span> {article.author}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Published:</span> {article.publishedAt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body with Table of Contents */}
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              {/* Main content */}
              <article className="lg:col-span-8 min-w-0">
                <div className="space-y-10 sm:space-y-12">
                  {article.sections.map((section, idx) => (
                    <div key={idx} id={`section-${idx}`} className="scroll-mt-24">
                      <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                        {section.heading}
                      </h2>
                      <div className="space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[17px] sm:leading-8">
                        {section.body.map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Sidebar with Table of Contents & Navigation */}
              <aside className="mt-12 lg:col-span-4 lg:mt-0">
                <div className="sticky top-24 space-y-6">
                  {article.sections.length > 1 && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Contents
                      </p>
                      <nav className="mt-3 space-y-2 text-xs">
                        {article.sections.map((section, idx) => (
                          <a
                            key={idx}
                            href={`#section-${idx}`}
                            className="block font-medium text-slate-600 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
                          >
                            {section.heading}
                          </a>
                        ))}
                      </nav>
                    </div>
                  )}

                  <div className="rounded-xl border border-teal-200/70 bg-teal-50/40 p-5 dark:border-teal-900/60 dark:bg-teal-950/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      Interactive Tools & Sandbox
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      Test FHIR queries, inspect HL7 messages, and explore connected EHR workflows interactively.
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Link
                        href="/tools"
                        className="inline-block rounded-lg bg-teal-700 px-3.5 py-2 text-center text-xs font-semibold text-white transition hover:bg-teal-800"
                      >
                        Open FHIR & HL7 Tools →
                      </Link>
                      <Link
                        href="/ehr-lis"
                        className="inline-block rounded-lg border border-teal-300 bg-white px-3.5 py-2 text-center text-xs font-semibold text-teal-800 transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300"
                      >
                        Explore EHR & LIS System
                      </Link>
                      <Link
                        href="/interopmind"
                        className="inline-block rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      >
                        Ask InteropMind
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-slate-200/80 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900 md:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">Related Reading</h2>
                <Link
                  href="/articles"
                  className="text-xs font-medium text-teal-700 transition hover:text-teal-800 dark:text-teal-400"
                >
                  View all articles →
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((rel) => (
                  <article
                    key={rel.slug}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div>
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">{rel.category}</span>
                      <h3 className="mt-2 text-base font-bold text-slate-950 dark:text-white">
                        <Link href={`/articles/${rel.slug}`} className="hover:text-teal-700 dark:hover:text-teal-400">
                          {rel.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-400">{rel.excerpt}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
                      <span>{rel.author}</span>
                      <span>{rel.readingTime}</span>
                    </div>
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
