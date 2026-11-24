import Link from 'next/link'
import ArticlesDirectory, { ArticleCard } from '@/components/ArticlesDirectory'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getArticleAuthorName } from '@/lib/article-author'
import { db } from '@/lib/db'

export const metadata = {
  title: 'Articles & Guides | InteropMed',
  description:
    'Evidence-based articles and guides on clinical informatics, healthcare data standards, EMR workflows, and hospital technology implementation.',
}

export const dynamic = 'force-dynamic'

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
    return dbArticles.map((item) => ({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt || item.content.slice(0, 180),
      category: item.category,
      author: getArticleAuthorName(item),
      publishedAt: formatDate(item.publishedAt || item.createdAt),
      readingTime: getReadingTime(item.content),
      featuredImage: item.featuredImage,
    }))
  } catch (error) {
    console.error('Error loading published articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const allArticles = await getPublishedArticles()

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Editorial Masthead */}
        <header className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800 dark:bg-slate-900/40 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Clinical Informatics &amp; Standards Library
                </div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                  Architecture Guides &amp; Publications
                </h1>
                <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  Evidence-based guides, integration playbooks, and healthcare standards architecture for hospital IT engineers and clinical informatics practitioners.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-400"
                >
                  <span>Test in FHIR Sandbox</span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/interopmind"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
                >
                  <span>Ask InteropMind AI</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Directory & Publications */}
        <section className="py-10 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ArticlesDirectory articles={allArticles} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
