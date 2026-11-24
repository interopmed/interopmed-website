import { getAccountSessionUser } from '@/lib/account-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsRedirectPage() {
  const user = await getAccountSessionUser()

  if (!user) {
    redirect('/account/login?next=%2Fsettings')
  }

  if (user.role === 'admin') {
    redirect('/account/settings')
  }

  redirect('/user/settings')
}
