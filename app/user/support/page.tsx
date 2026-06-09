import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountSupportRequestForm from '@/components/AccountSupportRequestForm'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Support | InteropMed',
  description: 'Get support for your InteropMed user account.',
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function statusClassName(status: string) {
  if (status === 'responded') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
  }

  if (status === 'reviewed') {
    return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
  }

  if (status === 'archived') {
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  }

  return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
}

export default async function UserSupportPage() {
  const user = await requireMemberUser('/user/support')
  const supportRequests = await prisma.contactMessage.findMany({
    where: {
      email: user.email,
      source: 'user_support_page',
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      topic: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const openCount = supportRequests.filter((request) => request.status === 'new' || request.status === 'reviewed').length
  const routingQueues = [
    {
      label: 'Account help',
      match: 'Account help',
      detail: 'Login, password, profile, notification, and account access requests.',
    },
    {
      label: 'Studio access',
      match: 'Studio access',
      detail: 'Workspace launch, permissions, and authenticated Studio access requests.',
    },
    {
      label: 'FHIR or HL7 workflow',
      match: 'FHIR or HL7 workflow',
      detail: 'Mapping, validation, implementation guide, HL7 v2, and FHIR workflow requests.',
    },
    {
      label: 'Billing or subscription',
      match: 'Billing or subscription',
      detail: 'Plan, invoice, subscription, and commercial account requests.',
    },
    {
      label: 'Bug report',
      match: 'Bug report',
      detail: 'Unexpected behavior, errors, broken UI, and failed API workflow reports.',
    },
  ].map((queue) => ({
    ...queue,
    count: supportRequests.filter((request) => request.topic.startsWith(queue.match)).length,
  }))

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Support' }]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <AccountSupportRequestForm />
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Requests</p>
                    <h2 className="mt-2 text-2xl font-bold">Recent support requests</h2>
                  </div>
                  <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {openCount} open
                  </span>
                </div>
                <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {supportRequests.map((request) => (
                    <div key={request.id} className="p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950 dark:text-white">{request.topic}</p>
                          <p className="mt-1 text-xs text-slate-400">Created {formatDateTime(request.createdAt)}</p>
                        </div>
                        <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${statusClassName(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {request.message}
                      </p>
                    </div>
                  ))}
                  {supportRequests.length === 0 && (
                    <div className="p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      No support requests have been sent from this account yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Live request routing</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                  {routingQueues.map((queue) => (
                    <div key={queue.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950 dark:text-white">{queue.label}</p>
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {queue.count}
                        </span>
                      </div>
                      <p className="mt-1 leading-6">{queue.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
