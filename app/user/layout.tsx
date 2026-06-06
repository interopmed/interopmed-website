import type { ReactNode } from 'react'
import UserAccountLayout from '@/components/UserAccountLayout'

export default function UserLayout({ children }: { children: ReactNode }) {
  return <UserAccountLayout>{children}</UserAccountLayout>
}
