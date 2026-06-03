import { redirect } from 'next/navigation'
import AccountRegisterForm from '@/components/AccountRegisterForm'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getAccountSessionUser, getSafeAccountRedirectPath } from '@/lib/account-auth'

export const metadata = {
  title: 'Register Account | InteropMed',
  description: 'Create an InteropMed account with a username, email, and password.',
}

type AccountRegisterPageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

export default async function AccountRegisterPage({ searchParams }: AccountRegisterPageProps) {
  const accountUser = await getAccountSessionUser()

  if (accountUser) {
    redirect('/account')
  }

  const params = await searchParams
  const next = getSafeAccountRedirectPath(params.next)

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-6 py-16 dark:bg-slate-900">
        <AccountRegisterForm redirectTo={next} />
      </main>
      <Footer />
    </>
  )
}
