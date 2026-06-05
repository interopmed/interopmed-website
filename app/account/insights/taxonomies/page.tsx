import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function InsightTaxonomiesPage() {
  redirect('/account/insights/categories')
}
