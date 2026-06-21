import InteropMindWorkspace from '@/components/InteropMindWorkspace'
import { getAccountSessionUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'InteropMind | InteropMed',
  description: 'Use InteropMind for healthcare interoperability workflow guidance, FHIR and HL7 education, support triage, and implementation planning.',
}

export default async function InteropMindWorkspacePage() {
  const user = await getAccountSessionUser()

  return <InteropMindWorkspace user={user} />
}
