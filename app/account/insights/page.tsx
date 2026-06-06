import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import InsightAgentForm from '@/components/InsightAgentForm'
import InsightChat from '@/components/InsightChat'
import InsightCreateForm from '@/components/InsightCreateForm'
import { requireAdminUser } from '@/lib/account-auth'
import { getArticleAuthorName } from '@/lib/article-author'
import { db } from '@/lib/db'
import { getInsightTaxonomyOptions } from '@/lib/taxonomies'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Codex Workspace | InteropMed',
  description: 'Use InteropMed Codex to review interoperability strategy and create standards-aware insight articles.',
}

async function getRecentInsights() {
  try {
    return await db.insight.findMany({ take: 8 })
  } catch (error) {
    console.error('Error loading account insights:', error)
    return []
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}

export default async function AccountInsightsPage() {
  await requireAdminUser('/account/insights')
  const [insights, taxonomyOptions] = await Promise.all([
    getRecentInsights(),
    getInsightTaxonomyOptions(),
  ])

  return (
    <>
      <main className="bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="py-4 md:py-6">
          <div className="mx-auto">
            <AccountBreadcrumb items={[{ label: 'Insights' }]} />
          </div>
          <div className="mx-auto grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 md:grid-cols-3">
                  <a href="#review" className="rounded-lg bg-slate-950 px-4 py-3 text-center text-white dark:bg-white dark:text-slate-950">
                    AI review
                  </a>
                  <a href="#generate" className="rounded-lg border border-slate-200 px-4 py-3 text-center transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
                    AI generate
                  </a>
                  <a href="#manual" className="rounded-lg border border-slate-200 px-4 py-3 text-center transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
                    Editor
                  </a>
                </div>
              </div>

              <div id="review" className="scroll-mt-24">
                <InsightChat />
              </div>
              <div id="generate" className="scroll-mt-24">
                <InsightAgentForm />
              </div>
              <div id="manual" className="scroll-mt-24">
                <InsightCreateForm taxonomyOptions={taxonomyOptions} />
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Library
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                    Recent insights
                  </h2>
                </div>
                <Link href="/insights" className="text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                  Public
                </Link>
              </div>

              <div className="mt-5 grid gap-2">
                <Link
                  href="/account/insights/categories"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300"
                >
                  Manage categories
                  <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link
                  href="/account/insights/tags"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300"
                >
                  Manage tags
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>

              {insights.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800">
                  {insights.map((insight) => (
                    <article key={insight.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {insight.status}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(insight.createdAt)}</p>
                      </div>
                      <h3 className="text-sm font-semibold leading-6 text-slate-950 dark:text-white">{insight.title}</h3>
                      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {getArticleAuthorName(insight)}
                      </p>
                      <Link
                        href={`/account/insights/${insight.id}/edit`}
                        className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                      >
                        Edit
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-400">
                  No database insights loaded yet. After creating an insight, refresh this page to see it in the recent list.
                </p>
              )}

              <div className="mt-6 rounded-lg border border-slate-200 bg-stone-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Editorial note</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  New posts are attributed to the active account. No Author ID is required.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}
