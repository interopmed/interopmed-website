import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireAdminUser } from '@/lib/account-auth'
import { getArticleAuthorName } from '@/lib/article-author'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Dashboard | InteropMed',
  description: 'InteropMed account dashboard for managing insights and internal content.',
}

type DashboardStats = {
  totalInsights: number
  publishedInsights: number
  draftInsights: number
  companies: number
  employees: number
  messages: number
  newMessages: number
  recentInsights: Array<{
    id: string
    title: string
    status: string
    category: string
    createdAt: Date
    author: { firstName: string; lastName: string } | null
    accountAuthor: { username: string; email: string; displayName: string | null } | null
  }>
  hasData: boolean
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      totalInsights,
      publishedInsights,
      draftInsights,
      companies,
      employees,
      messages,
      newMessages,
      recentInsights,
    ] = await Promise.all([
      db.insight.count(),
      db.insight.count('published'),
      db.insight.count('draft'),
      db.prisma.company.count(),
      db.prisma.employee.count(),
      db.prisma.contactMessage.count(),
      db.prisma.contactMessage.count({ where: { status: 'new' } }),
      db.insight.findMany({ take: 4 }),
    ])

    return {
      totalInsights,
      publishedInsights,
      draftInsights,
      companies,
      employees,
      messages,
      newMessages,
      recentInsights,
      hasData: true,
    }
  } catch (error) {
    console.error('Error loading account dashboard:', error)
    return {
      totalInsights: 0,
      publishedInsights: 0,
      draftInsights: 0,
      companies: 0,
      employees: 0,
      messages: 0,
      newMessages: 0,
      recentInsights: [],
      hasData: false,
    }
  }
}

export default async function AccountDashboardPage() {
  await requireAdminUser('/account')
  const stats = await getDashboardStats()
  const publishRate = stats.totalInsights === 0 ? 0 : clampPercent(Math.round((stats.publishedInsights / stats.totalInsights) * 100))
  const draftRate = stats.totalInsights === 0 ? 0 : clampPercent(Math.round((stats.draftInsights / stats.totalInsights) * 100))
  const responseLoad = stats.messages === 0 ? 0 : clampPercent(Math.round((stats.newMessages / stats.messages) * 100))

  const metricCards = [
    {
      label: 'Published insights',
      value: stats.publishedInsights,
      detail: `${publishRate}% of content library is live`,
      accent: 'from-emerald-500 to-teal-500',
      track: publishRate,
    },
    {
      label: 'Draft queue',
      value: stats.draftInsights,
      detail: `${draftRate}% awaiting editorial review`,
      accent: 'from-amber-400 to-orange-500',
      track: draftRate,
    },
    {
      label: 'Contact messages',
      value: stats.messages,
      detail: `${stats.newMessages} new conversations need attention`,
      accent: 'from-sky-500 to-blue-600',
      track: responseLoad,
    },
    {
      label: 'Content network',
      value: stats.companies + stats.employees,
      detail: `${stats.companies} companies and ${stats.employees} authors`,
      accent: 'from-fuchsia-500 to-rose-500',
      track: clampPercent((stats.companies + stats.employees) * 8),
    },
  ]

  const quickActions = [
    { href: '/tools', label: 'FHIR & HL7 Tools', detail: 'Inspect messages and test FHIR operations.', meta: 'Tools' },
    { href: '/account/insights', label: 'Create insight', detail: 'Draft or publish thought leadership content.', meta: 'Content' },
    { href: '/account/messages', label: 'Contact messages', detail: 'Review new website inquiries and lead signals.', meta: 'Leads' },
    { href: '/account/users', label: 'Manage users', detail: 'Add or update account access for the team.', meta: 'Access' },
  ]

  return (
    <>
      <main className="bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="py-4 md:py-6">
          <div className="mx-auto">
            <AccountBreadcrumb items={[{ label: 'Dashboard' }]} />

            {!stats.hasData && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                Dashboard database stats could not be loaded. The account page is available, but operational counts will stay at zero until the database connection is healthy.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card) => (
                <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className={`mb-5 h-1.5 rounded-full bg-gradient-to-r ${card.accent}`} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-4xl font-bold">{card.value}</p>
                    <p className="text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live</p>
                  </div>
                  <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">{card.detail}</p>
                  <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${card.accent}`} style={{ width: `${card.track}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Primary workspace</p>
                    <h2 className="mt-2 text-xl font-bold">Today&apos;s control surface</h2>
                  </div>
                  <Link href="/tools" className="rounded-lg bg-slate-950 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                    Open Tools
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:border-teal-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400">{action.meta}</p>
                          <h3 className="mt-3 text-lg font-bold">{action.label}</h3>
                        </div>
                        <span className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold text-slate-500 transition group-hover:border-teal-300 group-hover:text-teal-700 dark:border-slate-800 dark:text-slate-400 dark:group-hover:text-teal-300">
                          -&gt;
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.detail}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Recent insights</p>
                    <h2 className="mt-2 text-xl font-bold">Editorial activity</h2>
                  </div>
                  <Link href="/account/insights" className="text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
                    View all
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {stats.recentInsights.length > 0 ? (
                    stats.recentInsights.map((insight) => (
                      <Link
                        key={insight.id}
                        href="/account/insights"
                        className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold leading-6">{insight.title}</h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                              {getArticleAuthorName(insight)}
                            </p>
                          </div>
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            {insight.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          <span>{insight.category}</span>
                          <span>{formatDate(insight.createdAt)}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      No recent insights yet. Start with the insight editor to build the first item in the editorial feed.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Lead queue</p>
                <p className="mt-3 text-3xl font-bold">{stats.newMessages}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  New contact messages are waiting for review before they move into responded or archived states.
                </p>
                <Link href="/account/messages" className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Review messages
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Public experience</p>
                <p className="mt-3 text-3xl font-bold">{stats.publishedInsights}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Published insights are visible to visitors and should stay aligned with the active implementation story.
                </p>
                <Link href="/insights" className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  View public page
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Team access</p>
                <p className="mt-3 text-3xl font-bold">{stats.employees}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Account users and authors keep content ownership traceable across the InteropMed workspace.
                </p>
                <Link href="/account/users" className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Manage access
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
