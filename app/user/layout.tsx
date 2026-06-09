import type { ReactNode } from 'react'
import UserAccountLayout from '@/components/UserAccountLayout'
import { getAccountSessionUser } from '@/lib/account-auth'

export default async function UserLayout({ children }: { children: ReactNode }) {
  const user = await getAccountSessionUser()

  return <UserAccountLayout user={user}>{children}</UserAccountLayout>
}
