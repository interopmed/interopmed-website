import { redirect } from 'next/navigation'

export default async function LegacyMemberProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  redirect(`/people/${encodeURIComponent(username)}`)
}
