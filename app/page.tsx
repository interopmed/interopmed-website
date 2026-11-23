import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import { articles } from '@/lib/articles'
import { db } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'InteropMed | Health Informatics & Interoperability Knowledge Platform',
  description: 'Evidence-based articles, clinical workflow analyses, healthcare standards, and digital health implementation guides.',
}

export const dynamic = 'force-dynamic'

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
      author: a.author
        ? `${a.author.firstName} ${a.author.lastName}`
        : (a.accountAuthor?.displayName || 'InteropMed Contributor'),
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

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfdfd] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* EDITORIAL COVER STORY (CLEAN, NATURAL, PUBLICATION LAYOUT) */}
        <section className="border-b border-slate-200/70 py-10 dark:border-slate-800 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1.45fr_1fr] xl:gap-16">
              {/* PRIMARY LEAD STORY */}
              {leadStory && (
                <article className="flex flex-col justify-between border-b border-slate-200/70 pb-10 dark:border-slate-800 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12 xl:pr-16">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                        {leadStory.category}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{leadStory.readingTime}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 transition hover:text-teal-700 dark:text-white dark:hover:text-teal-400 sm:text-4xl md:text-[2.6rem] md:leading-[1.18]">
                      <Link href={`/articles/${leadStory.slug}`}>
                        {leadStory.title}
                      </Link>
                    </h1>

                    <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
                      {leadStory.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{leadStory.author}</span>
                      <span>•</span>
                      <span>{leadStory.publishedAt}</span>
                    </div>
                    <Link
                      href={`/articles/${leadStory.slug}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-400"
                    >
                      Read full article
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              )}

              {/* SECONDARY STORIES (RIGHT SIDEBAR) */}
              <div className="flex flex-col justify-between space-y-8">
                <div>
                  <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Editor&apos;s Picks
                    </h2>
                    <Link href="/articles" className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                      View all articles →
                    </Link>
                  </div>

                  <div className="space-y-7">
                    {secondaryStories.map((item) => (
                      <article key={item.slug} className="group border-b border-slate-100 pb-7 last:border-b-0 dark:border-slate-800/70">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-teal-700 dark:text-teal-400">{item.category}</span>
                          <span>•</span>
                          <span>{item.readingTime}</span>
                        </div>
                        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                          <Link href={`/articles/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-400">
                          {item.excerpt}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.author}</span>
                          <span>{item.publishedAt}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* INTEROPMIND DISCOVERY CALLOUT */}
                <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Interactive Learning Lab
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Have a question about FHIR mapping, clinical codes, or EMR workflow design? Ask questions directly in the InteropMind workspace.
                  </p>
                  <Link
                    href="/interopmind"
                    className="mt-3 inline-block rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                  >
                    Open InteropMind Workspace →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HANDS-ON INTEROPERABILITY TOOLS & EHR/LIS EXPLORATION */}
        <section className="border-b border-slate-200/70 py-12 dark:border-slate-800 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Practical Learning
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Hands-on Interoperability & Clinical Systems
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Move from theory to practice with our interactive tools and clinical workflows.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1: Interoperability Tools */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">Testing Utilities</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Live Sandbox</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    Interoperability Tools & Message Parser
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Interact with real FHIR REST APIs—query Patient demographics, vital observations, and lab reports. Test our HL7 v2 segment parser on sample ADT and ORU messages.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-slate-50 px-2.5 py-1 text-slate-700 border border-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">FHIR Resource Playground</span>
                    <span className="rounded-md bg-slate-50 px-2.5 py-1 text-slate-700 border border-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">HL7 v2 Message Inspector</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
                  >
                    Open Interoperability Tools →
                  </Link>
                </div>
              </div>

              {/* Card 2: EHR & LIS System */}
              <div className="flex flex-col justify-between rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white to-teal-50/30 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:border-teal-400 dark:border-teal-900/60 dark:from-slate-900 dark:to-teal-950/30">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">Clinical Workflow</span>
                    <span className="rounded bg-teal-100/60 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-300">EHR + LIS</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    Explore Our Connected EHR & LIS System
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    See how patient encounters, doctor orders (CPOE), and laboratory specimen tests communicate end-to-end using international standards like LOINC, SNOMED, and FHIR.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-white/80 px-2.5 py-1 text-teal-800 border border-teal-200/60 shadow-sm dark:bg-slate-800 dark:border-teal-900 dark:text-teal-300">Clinical Charting</span>
                    <span className="rounded-md bg-white/80 px-2.5 py-1 text-teal-800 border border-teal-200/60 shadow-sm dark:bg-slate-800 dark:border-teal-900 dark:text-teal-300">Laboratory Specimen Tracking</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-teal-100 pt-5 dark:border-teal-900/60">
                  <Link
                    href="/ehr-lis"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                  >
                    Explore EHR & LIS System →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: RECENT DISPATCHES FROM THE COMMUNITY STREAM */}
        <section className="border-b border-slate-200/70 py-12 dark:border-slate-800 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Community Stream
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Dispatches from the Community
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Practical questions, implementation stories, and discussions from clinical practitioners.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/community"
                  className="text-xs font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
                >
                  About Community
                </Link>
                <Link
                  href="/stream"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
                >
                  Join the Stream →
                </Link>
              </div>
            </div>

            {recentPosts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.02)] dark:border-slate-800 dark:bg-slate-900"
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
                      <p className="mt-3 text-xs leading-relaxed text-slate-700 line-clamp-3 dark:text-slate-300">
                        {post.content}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">#{post.topic}</span>
                      <span>{post.createdAtFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Follow live clinical informatics discussions, implementation notes, and peer updates on the Stream.
                </p>
                <Link href="/stream" className="mt-2 inline-block text-xs font-bold text-teal-700 hover:underline">
                  Open Stream Activity Feed →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: INFORMATICS GUIDES & EDUCATIONAL PILLARS (WARM, HUMAN, NON-REDUNDANT) */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Core Curriculum
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Explore Essential Topics in Digital Health
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Curated educational guides to help you understand health technology without the jargon.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">01. Clinical Informatics</span>
                  <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    Workflows, EMR Design & Care Teams
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    How patient triage, nursing handoffs, and electronic chart documentation fit together in daily medical practice.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/clinical-informatics" className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                    Explore clinical informatics →
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">02. Interoperability & Codes</span>
                  <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    FHIR, HL7 & Medical Standards
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    A plain-English breakdown of international standards, medical terminology (SNOMED, LOINC), and web APIs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/interoperability" className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                    Explore interoperability standards →
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">03. Digital Health Rollouts</span>
                  <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    Implementation & Change Management
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Pragmatic advice on training clinicians, shadowing paper workflows, and launching systems smoothly.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/implementation" className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                    Explore implementation guides →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
