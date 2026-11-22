import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import { articles } from '@/lib/articles'
import { db } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'InteropMed | Health Informatics & Healthcare Interoperability',
  description: 'Evidence-based articles, clinical workflow analyses, healthcare standards, and digital health implementation guides.',
}

export const dynamic = 'force-dynamic'

const standardBadges = [
  { name: 'HL7 FHIR', desc: 'Modern REST & JSON data exchange specifications', link: '/interoperability' },
  { name: 'HL7 v2.x', desc: 'Hospital interface engine messaging (ADT, ORM, ORU)', link: '/knowledge' },
  { name: 'SNOMED CT', desc: 'Global polyhierarchical clinical healthcare terminology', link: '/articles/terminology-strategy-snomed-loinc-icd' },
  { name: 'LOINC', desc: 'Universal code system for lab tests and clinical observations', link: '/articles/terminology-strategy-snomed-loinc-icd' },
  { name: 'ICD-10 / 11', desc: 'WHO diagnostic classifications for morbidity & epidemiology', link: '/resources' },
  { name: 'DICOM', desc: 'Medical imaging communication and DICOMweb protocols', link: '/articles/medical-imaging-dicom-fhir-integration' },
]

const knowledgeTopics = [
  {
    title: 'Clinical Informatics',
    count: 'Workflows & EMR',
    href: '/clinical-informatics',
    description: 'Clinical documentation, CPOE, decision support, and cognitive load in patient care.',
  },
  {
    title: 'Healthcare Interoperability',
    count: 'Standards & APIs',
    href: '/interoperability',
    description: 'FHIR resources, terminology servers, and semantic data models.',
  },
  {
    title: 'Digital Health Implementation',
    count: 'Strategy & Governance',
    href: '/implementation',
    description: 'Pre-implementation workflow assessment, change management, and user adoption.',
  },
  {
    title: 'Healthcare Technology',
    count: 'Systems & Architecture',
    href: '/technology',
    description: 'Medical device connectivity, hospital software design, and cybersecurity.',
  },
  {
    title: 'Standards & References',
    count: 'Technical Guides',
    href: '/resources',
    description: 'Curated technical specifications, terminology systems, and mapping rules.',
  },
  {
    title: 'Interactive Learning',
    count: 'InteropMind Lab',
    href: '/interopmind',
    description: 'Interactive environment to evaluate clinical workflows and standards.',
  },
]

type ArticleItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: string
}

async function getAllPublishedArticles(): Promise<ArticleItem[]> {
  try {
    const dbArticles = await db.insight.findMany({ status: 'published' })
    const dbMapped: ArticleItem[] = dbArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || a.content.slice(0, 180),
      category: a.category,
      author: a.author ? `${a.author.firstName} ${a.author.lastName}` : (a.accountAuthor?.displayName || 'InteropMed Research'),
      publishedAt: a.publishedAt
        ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent',
      readingTime: `${Math.max(1, Math.ceil(a.content.split(/\s+/).length / 200))} min read`,
    }))

    const staticMapped: ArticleItem[] = articles
      .filter((a) => !dbMapped.some((d) => d.slug === a.slug))
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        author: a.author,
        publishedAt: a.publishedAt,
        readingTime: a.readingTime,
      }))

    return [...dbMapped, ...staticMapped]
  } catch {
    return articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      author: a.author,
      publishedAt: a.publishedAt,
      readingTime: a.readingTime,
    }))
  }
}

async function getRecentStreamActivity() {
  try {
    const posts = await prisma.userPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        content: true,
        topic: true,
        createdAt: true,
        author: {
          select: {
            displayName: true,
            publicHandle: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    })

    return posts.map((p) => ({
      ...p,
      createdAtFormatted: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [allArticles, recentPosts] = await Promise.all([
    getAllPublishedArticles(),
    getRecentStreamActivity(),
  ])

  const leadStory = allArticles[0]
  const secondaryStories = allArticles.slice(1, 3)
  const moreStories = allArticles.slice(3)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      {/* TOP EDITORIAL MASTHEAD BAR */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{currentDate}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-medium text-teal-700 dark:text-teal-400">Health Informatics & Interoperability Publication</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {['FHIR R4', 'Clinical Workflows', 'SNOMED CT', 'EMR Usability', 'DICOMweb'].map((tag) => (
                <Link
                  key={tag}
                  href={`/articles?tag=${encodeURIComponent(tag)}`}
                  className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-teal-400"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* EDITORIAL COVER STORY & TOP HEADLINES (NEWSPAPER / MAGAZINE LAYOUT) */}
        <section className="border-b border-slate-200 py-10 dark:border-slate-800 md:py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] xl:gap-14">
              {/* PRIMARY LEAD STORY */}
              {leadStory && (
                <article className="flex flex-col justify-between border-b border-slate-200 pb-8 dark:border-slate-800 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10 xl:pr-14">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-teal-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {leadStory.category}
                      </span>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Featured Analysis</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{leadStory.readingTime}</span>
                    </div>

                    <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 transition hover:text-teal-600 dark:text-white dark:hover:text-teal-400 sm:text-4xl md:text-5xl">
                      <Link href={`/articles/${leadStory.slug}`}>
                        {leadStory.title}
                      </Link>
                    </h1>

                    <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                      {leadStory.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{leadStory.author}</span>
                      <span>•</span>
                      <span>{leadStory.publishedAt}</span>
                    </div>
                    <Link
                      href={`/articles/${leadStory.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                    >
                      Read full article
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              )}

              {/* SECONDARY LEAD STORIES (RIGHT COLUMN) */}
              <div className="flex flex-col justify-between space-y-8">
                <div>
                  <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                      Editor&apos;s Dispatch
                    </h2>
                    <Link href="/articles" className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                      All Articles ({allArticles.length}) →
                    </Link>
                  </div>

                  <div className="space-y-8">
                    {secondaryStories.map((item) => (
                      <article key={item.slug} className="group border-b border-slate-100 pb-7 last:border-b-0 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5 text-xs text-slate-500">
                          <span className="font-semibold text-teal-700 dark:text-teal-400">{item.category}</span>
                          <span>•</span>
                          <span>{item.readingTime}</span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950 transition group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                          <Link href={`/articles/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2 dark:text-slate-400">
                          {item.excerpt}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span>{item.author}</span>
                          <span>{item.publishedAt}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* EDITORIAL BRIEF CALLOUT */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Interactive Knowledge Explorer
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Query healthcare standards, test ADT-to-FHIR mappings, and review clinical informatics principles in real-time.
                  </p>
                  <Link
                    href="/interopmind"
                    className="mt-3 inline-block rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    Open InteropMind Workspace →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MORE ARTICLES & NEWS GRID */}
        {moreStories.length > 0 && (
          <section className="border-b border-slate-200 bg-slate-50/60 py-12 dark:border-slate-800 dark:bg-slate-900/30 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                    Informatics & Standards Articles
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Peer-reviewed guidance on data exchange, clinical architecture, and health system implementation.
                  </p>
                </div>
                <Link
                  href="/articles"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  View complete library →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {moreStories.map((article) => (
                  <article
                    key={article.slug}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">{article.category}</span>
                        <span className="text-slate-400">{article.readingTime}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-slate-950 dark:text-white">
                        <Link href={`/articles/${article.slug}`} className="transition hover:text-teal-600 dark:hover:text-teal-400">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3 dark:text-slate-300">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>{article.author}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LIVE COMMUNITY STREAM WIRE */}
        <section className="border-b border-slate-200 py-12 dark:border-slate-800 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Live Stream Wire
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                  Dispatches from the Community
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/community"
                  className="text-xs font-bold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
                >
                  About Community
                </Link>
                <Link
                  href="/stream"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Open Stream →
                </Link>
              </div>
            </div>

            {recentPosts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <ProfileAvatar
                          imageUrl={post.author.profileImage}
                          name={post.author.displayName || post.author.publicHandle}
                          className="h-8 w-8 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {post.author.displayName || 'Member'}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">@{post.author.publicHandle}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-700 line-clamp-3 dark:text-slate-300">
                        {post.content}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">#{post.topic}</span>
                      <span>{post.createdAtFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Follow live clinical informatics discussions, implementation notes, and peer updates on the Stream.
                </p>
                <Link href="/stream" className="mt-2 inline-block text-xs font-bold text-teal-600 hover:text-teal-700">
                  Open Stream Activity Feed →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* KNOWLEDGE PILLARS DIRECTORY */}
        <section className="border-b border-slate-200 bg-slate-50/80 py-12 dark:border-slate-800 dark:bg-slate-900/40 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Knowledge Curriculum</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                Core Health Informatics Domains
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeTopics.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{item.count}</span>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 transition group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600 transition group-hover:gap-2 dark:text-teal-400">
                    Explore domain
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HEALTHCARE STANDARDS QUICK REFERENCE */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Standards Reference</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  International Healthcare Standards
                </h2>
              </div>
              <Link href="/resources" className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                Full Standards Index →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {standardBadges.map((badge) => (
                <Link
                  key={badge.name}
                  href={badge.link}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="font-mono text-sm font-bold text-teal-700 group-hover:text-teal-600 dark:text-teal-400">
                    {badge.name}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {badge.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
