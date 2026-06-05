import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireAccountUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Contact Messages | InteropMed Account',
  description: 'Review contact form messages submitted through the InteropMed website.',
}

async function getContactMessages() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch (error) {
    console.error('Error loading contact messages:', error)
    return []
  }
}

function formatDate(value: Date) {
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AccountMessagesPage() {
  await requireAccountUser('/account/messages')
  const messages = await getContactMessages()

  return (
    <>
      <main className="bg-slate-50 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
        <section>
          <div className="mx-auto">
            <AccountBreadcrumb items={[{ label: 'Messages' }]} />
            {messages.length > 0 ? (
              <div className="grid gap-5">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">
                          {message.topic}
                        </p>
                        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                          {message.firstName} {message.lastName}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {message.email}
                          {message.organization ? ` / ${message.organization}` : ''}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>{message.status}</p>
                        <p>{formatDate(message.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-600 dark:text-slate-300">
                      {message.message}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                No contact messages have been saved yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
