import { redirect } from 'next/navigation'
import { requireMemberUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export default async function UserProfileRedirectPage() {
  const user = await requireMemberUser('/user/profile')

  redirect(`/people/${encodeURIComponent(user.publicHandle)}`)
}
