import { redirect } from 'next/navigation'
import { requireAccountUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const user = await requireAccountUser('/people')

  redirect(`/people/${encodeURIComponent(user.publicHandle)}`)
}
