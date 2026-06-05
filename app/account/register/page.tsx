import { redirect } from 'next/navigation'
import AccountRegisterForm from '@/components/AccountRegisterForm'
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
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
        <AccountRegisterForm redirectTo={next} />
      </main>
    </>
  )
}
