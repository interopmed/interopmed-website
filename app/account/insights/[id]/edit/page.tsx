import { notFound } from 'next/navigation'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import InsightEditorForm from '@/components/InsightEditorForm'
import { requireAccountUser } from '@/lib/account-auth'
import { db } from '@/lib/db'
import { getInsightTaxonomyOptions } from '@/lib/taxonomies'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Insight | InteropMed',
  description: 'Edit an InteropMed insight article.',
}

type EditInsightPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditInsightPage({ params }: EditInsightPageProps) {
  await requireAccountUser('/account/insights')
  const { id } = await params
  const [insight, taxonomyOptions] = await Promise.all([
    db.prisma.article.findFirst({
      where: {
        id,
        type: 'insight',
      },
      include: {
        author: true,
        accountAuthor: true,
      },
    }),
    getInsightTaxonomyOptions(),
  ])

  if (!insight) {
    notFound()
  }

  return (
    <>
      <main className="bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="py-4 md:py-6">
          <div className="mx-auto max-w-5xl">
            <AccountBreadcrumb
              items={[
                { label: 'Insights', href: '/account/insights' },
                { label: 'Edit' },
              ]}
            />
            <InsightEditorForm
              mode="edit"
              initialValue={{
                id: insight.id,
                title: insight.title,
                slug: insight.slug,
                excerpt: insight.excerpt,
                content: insight.content,
                category: insight.category,
                status: insight.status,
                featuredImage: insight.featuredImage,
                tags: insight.tags,
              }}
              taxonomyOptions={taxonomyOptions}
            />
          </div>
        </section>
      </main>
    </>
  )
}
