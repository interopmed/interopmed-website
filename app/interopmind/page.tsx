import InteropMindWorkspace from '@/components/InteropMindWorkspace'
import { getAccountSessionUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'InteropMind | Interactive Health Informatics Environment',
  description: 'An interactive space to explore health informatics concepts, healthcare standards, clinical information systems, and interoperability.',
}

export default async function InteropMindWorkspacePage() {
  const user = await getAccountSessionUser()

  return <InteropMindWorkspace user={user} />
}
