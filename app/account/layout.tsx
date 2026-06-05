import type { ReactNode } from 'react'
import AccountDashboardLayout from '@/components/AccountDashboardLayout'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountDashboardLayout>{children}</AccountDashboardLayout>
}
