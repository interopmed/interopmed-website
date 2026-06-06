import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import TaxonomyManager from '@/components/TaxonomyManager'
import { requireAdminUser } from '@/lib/account-auth'
import { getInsightTaxonomyOptions } from '@/lib/taxonomies'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Insight Categories | InteropMed',
  description: 'Manage insight article categories.',
}

export default async function InsightCategoriesPage() {
  await requireAdminUser('/account/insights/categories')
  const taxonomyOptions = await getInsightTaxonomyOptions()

  return (
    <main className="bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="py-4 md:py-6">
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'Insights', href: '/account/insights' }, { label: 'Categories' }]} />
          <TaxonomyManager
            terms={taxonomyOptions.terms}
            taxonomy="category"
            title="Category"
            emptyMessage="No categories have been created yet."
          />
        </div>
      </section>
    </main>
  )
}
