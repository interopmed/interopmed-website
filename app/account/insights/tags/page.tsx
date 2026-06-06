import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import TaxonomyManager from '@/components/TaxonomyManager'
import { requireAdminUser } from '@/lib/account-auth'
import { getInsightTaxonomyOptions } from '@/lib/taxonomies'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Insight Tags | InteropMed',
  description: 'Manage insight article tags.',
}

export default async function InsightTagsPage() {
  await requireAdminUser('/account/insights/tags')
  const taxonomyOptions = await getInsightTaxonomyOptions()

  return (
    <main className="bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="py-4 md:py-6">
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'Insights', href: '/account/insights' }, { label: 'Tags' }]} />
          <TaxonomyManager
            terms={taxonomyOptions.terms}
            taxonomy="post_tag"
            title="Tag"
            emptyMessage="No tags have been created yet."
          />
        </div>
      </section>
    </main>
  )
}
