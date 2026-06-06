import AccountLoginForm from '@/components/AccountLoginForm'
import { getSafeAccountRedirectPath } from '@/lib/account-auth'

export const metadata = {
  title: 'Account Login | InteropMed',
  description: 'Sign in to InteropMed.',
}

type AccountLoginPageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const params = await searchParams
  const next = getSafeAccountRedirectPath(params.next)

  return (
    <>
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
        <AccountLoginForm
          redirectTo={next}
          title="Account login"
          description="Sign in once. Admin accounts open the admin dashboard, and member accounts open the user account area."
          registerHref={null}
        />
      </main>
    </>
  )
}
