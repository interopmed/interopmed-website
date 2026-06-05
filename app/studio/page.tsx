import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getAccountSessionUser } from '@/lib/account-auth'
import {
  createStudioLaunchToken,
  getSafeStudioReturnPath,
  getStudioUrl,
} from '@/lib/studio-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'InteropMed Studio | InteropMed',
  description: 'Secure launcher for the external InteropMed Studio workspace.',
}

async function requireAccountSession() {
  return (await getAccountSessionUser()) !== null
}

async function getWebsiteOrigin() {
  const headerStore = await headers()
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host')
  const protocol = headerStore.get('x-forwarded-proto') || 'http'

  if (!host) {
    return undefined
  }

  return `${protocol}://${host}`
}

type StudioLauncherPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[]
  }>
}

export default async function StudioLauncherPage({ searchParams }: StudioLauncherPageProps) {
  const params = await searchParams
  const returnTo = getSafeStudioReturnPath(params.returnTo)
  const hasSession = await requireAccountSession()

  if (!hasSession) {
    const nextPath =
      returnTo === '/' ? '/studio' : `/studio?returnTo=${encodeURIComponent(returnTo)}`
    redirect(`/account/login?next=${encodeURIComponent(nextPath)}`)
  }

  const studioUrl = getStudioUrl()

  if (studioUrl) {
    const websiteUrl = await getWebsiteOrigin()
    const token = createStudioLaunchToken(returnTo, websiteUrl)
    redirect(
      `${studioUrl}/auth/complete?token=${encodeURIComponent(token)}&returnTo=${encodeURIComponent(returnTo)}`
    )
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-16 dark:bg-slate-950 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Studio launcher
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
              Studio is protected, but its destination URL is not configured yet.
            </h1>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              InteropMed account access is working. Set <code>INTEROPMED_STUDIO_URL</code> to the
              Studio subdomain or hosted URL, and this launcher will mint a signed session handoff
              for authenticated users automatically.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Expected environment variable
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-sky-100">
                <code>INTEROPMED_STUDIO_URL=https://studio.interopmed.com</code>
              </pre>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/account"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Back to account
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Coordinate deployment
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
