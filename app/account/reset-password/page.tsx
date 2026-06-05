import { redirect } from 'next/navigation'
import AccountPasswordResetRequestForm from '@/components/AccountPasswordResetRequestForm'
import { getAccountSessionUser } from '@/lib/account-auth'

export const metadata = {
  title: 'Reset Password | InteropMed',
  description: 'Generate a password reset link for your InteropMed account.',
}

export default async function AccountResetPasswordPage() {
  const accountUser = await getAccountSessionUser()

  if (accountUser) {
    redirect('/account')
  }

  return (
    <>
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
        <AccountPasswordResetRequestForm />
      </main>
    </>
  )
}
