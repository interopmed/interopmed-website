import AccountPasswordResetConfirmForm from '@/components/AccountPasswordResetConfirmForm'
import { getPasswordResetTokenRecord } from '@/lib/account-auth'

export const metadata = {
  title: 'Choose New Password | InteropMed',
  description: 'Use your one-time InteropMed password reset link to set a new password.',
}

type ResetPasswordTokenPageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function ResetPasswordTokenPage({ params }: ResetPasswordTokenPageProps) {
  const { token } = await params
  const record = await getPasswordResetTokenRecord(token)

  return (
    <>
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12">
        {record ? (
          <AccountPasswordResetConfirmForm token={token} />
        ) : (
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20 md:p-8">
            <h1 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">Reset link expired</h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              This password reset link is invalid or has already been used. Generate a fresh one from the reset page.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
