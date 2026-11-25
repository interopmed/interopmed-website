import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function StudioRedirectPage() {
  const isDev = process.env.NODE_ENV === 'development'
  const studioUrl = process.env.INTEROPMED_STUDIO_URL?.trim() || (isDev ? 'http://127.0.0.1:3100' : 'https://studio.interopmed.com')
  redirect(studioUrl)
}
