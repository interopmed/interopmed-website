import { redirect } from 'next/navigation'
import { STUDIO_URL } from '@/lib/studio-constants'

export const dynamic = 'force-dynamic'

export default function StudioRedirectPage() {
  redirect(STUDIO_URL)
}
