import { redirect } from 'next/navigation'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountUserCreateForm from '@/components/AccountUserCreateForm'
import { requireAdminUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Users | InteropMed',
  description: 'Create and review real InteropMed account users.',
}

async function getAuthUsers() {
  try {
    return await prisma.authUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error loading account users:', error)
    return []
  }
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'Never'
  }

  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AccountUsersPage() {
  const accountUser = await requireAdminUser('/account/users')

  if (accountUser.role !== 'admin') {
    redirect('/account')
  }

  const users = await getAuthUsers()

  return (
    <>
      <main className="bg-slate-50 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
        <section>
          <div className="mx-auto">
            <AccountBreadcrumb items={[{ label: 'Users' }]} />
          </div>
          <div className="mx-auto grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <AccountUserCreateForm />

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">Existing users</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                          {user.displayName || user.username}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          @{user.username} / {user.email}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>{user.role}</p>
                        <p>{user.isActive ? 'active' : 'inactive'}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                      <p>Created: {formatDate(user.createdAt)}</p>
                      <p>Last login: {formatDate(user.lastLoginAt)}</p>
                    </div>
                  </article>
                ))}
                {users.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No auth users found yet.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
