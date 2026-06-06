import { redirect } from 'next/navigation'
import { getSafeAccountRedirectPath } from '@/lib/account-auth'

export const metadata = {
  title: 'Account Login | InteropMed',
  description: 'Sign in to InteropMed.',
}

type UserLoginPageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

export default async function UserLoginPage({ searchParams }: UserLoginPageProps) {
  const params = await searchParams
  const next = getSafeAccountRedirectPath(params.next, '/user')

  redirect(`/account/login?next=${encodeURIComponent(next)}`)
}
