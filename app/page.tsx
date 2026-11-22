import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import { articles } from '@/lib/articles'
import { db } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'InteropMed | Health Informatics & Healthcare Interoperability',
  description: 'Explore health informatics, clinical information systems, healthcare interoperability, HL7 FHIR, healthcare standards and digital health implementation.',
}

export const dynamic = 'force-dynamic'

const knowledgeCategories = [
  {
    title: 'Clinical Informatics',
    description: 'Clinical workflows, EMR architecture, CPOE, decision support, and human factors in digital patient care.',
    href: '/clinical-informatics',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Healthcare Interoperability',
    description: 'Data exchange architectures, HL7 v2, FHIR resources, terminology bindings, and medical imaging protocols.',
    href: '/interoperability',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Digital Health Implementation',
    description: 'Pragmatic guides for clinical workflow assessments, change management, clinician training, and adoption.',
    href: '/implementation',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Healthcare Technology',
    description: 'Medical device connectivity, laboratory analyzers, hospital software architecture, and cybersecurity.',
    href: '/technology',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Healthcare Standards',
    description: 'Deep reference documentation on FHIR specifications, SNOMED CT, LOINC, ICD-10, and DICOM.',
    href: '/resources',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Healthcare Resources',
    description: 'Practical mapping patterns, glossary terms, architecture checklists, and learning pathways.',
    href: '/knowledge',
    icon: (
      <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

const standardBadges = [
  { name: 'HL7 FHIR', desc: 'Modern REST & JSON specifications' },
  { name: 'HL7 v2.x', desc: 'Hospital interface messaging' },
  { name: 'SNOMED CT', desc: 'Clinical healthcare terminology' },
  { name: 'LOINC', desc: 'Lab & observation code system' },
  { name: 'ICD-10', desc: 'Disease & diagnostic classifications' },
  { name: 'DICOM', desc: 'Medical imaging communications' },
]

async function getFeaturedArticles() {
  try {
    const dbArticles = await db.insight.findMany({ status: 'published', take: 3 })
    const dbMapped = dbArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || a.content.slice(0, 160),
      category: a.category,
      publishedAt: a.publishedAt
        ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent',
      readingTime: `${Math.max(1, Math.ceil(a.content.split(/\s+/).length / 200))} min read`,
    }))

    const staticMapped = articles
      .filter((a) => !dbMapped.some((d) => d.slug === a.slug))
      .slice(0, Math.max(0, 3 - dbMapped.length))
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        publishedAt: a.publishedAt,
        readingTime: a.readingTime,
      }))

    return [...dbMapped, ...staticMapped].slice(0, 3)
  } catch {
    return articles.slice(0, 3).map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
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
      take: 3,
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
  const [featuredArticles, recentPosts] = await Promise.all([
    getFeaturedArticles(),
    getRecentStreamActivity(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.12),rgba(255,255,255,0))] py-20 dark:border-slate-800 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.18),rgba(2,6,23,0))] md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5 text-xs font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-300">
                <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
                Health Informatics & Interoperability Knowledge Platform
              </div>

              <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
                Health Informatics. Interoperability. Better Healthcare Systems.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                Explore the technologies, standards and clinical workflows shaping the future of digital healthcare.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/articles"
                  className="rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Explore Articles
                </Link>
                <Link
                  href="/interoperability"
                  className="rounded-xl border border-slate-300 px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Explore Interoperability
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPLORE KNOWLEDGE (6 CATEGORY CARDS) */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/40 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Knowledge Pillars</p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                Explore Knowledge Areas
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                Comprehensive foundations designed for clinical officers, informaticians, researchers, and systems architects.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeCategories.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60">
                      {cat.icon}
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-950 transition group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                      {cat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-teal-600 transition group-hover:gap-2.5 dark:text-teal-400">
                    Explore section
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURED ARTICLES (LATEST INSIGHTS) */}
        <section className="py-20 md:py-24 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Publications
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                  Latest Insights
                </h2>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
              >
                Explore All Articles
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-400">{article.readingTime}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-snug text-slate-950 dark:text-white">
                      <Link href={`/articles/${article.slug}`} className="transition hover:text-teal-600 dark:hover:text-teal-400">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3 dark:text-slate-300">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{article.publishedAt}</span>
                    <Link href={`/articles/${article.slug}`} className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                      Read article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: CLINICAL INFORMATICS */}
        <section className="bg-slate-50 py-20 dark:bg-slate-900/40 md:py-24 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Clinical Practice & Informatics
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                  Connecting Clinical Practice with Digital Health
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                  Discover how clinical knowledge, healthcare workflows and information technology come together to improve the design and implementation of digital health systems.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h4 className="font-bold text-slate-900 dark:text-white">EMR Workflow Alignment</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Bridging the gap between physician triage, nursing handoffs, and electronic chart documentation.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h4 className="font-bold text-slate-900 dark:text-white">Decision Support Without Alert Fatigue</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Designing targeted, context-aware clinical reminders that protect patient safety without interrupting clinical flow.
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/clinical-informatics"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                  >
                    Explore Clinical Informatics
                    <span>→</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">Clinical Informatics Reading</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Recommended educational guides for clinical leaders and digital health practitioners:
                </p>
                <div className="mt-6 space-y-4">
                  <Link
                    href="/articles/clinical-workflows-and-emr-architecture"
                    className="block rounded-xl border border-slate-100 p-4 transition hover:border-teal-300 hover:bg-teal-50/30 dark:border-slate-800 dark:hover:border-slate-700"
                  >
                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Guide</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      Clinical Workflows and the Architecture of Modern EMRs
                    </p>
                    <p className="mt-1 text-xs text-slate-500">7 min read • Triage, CPOE, and CDS</p>
                  </Link>
                  <Link
                    href="/articles/digital-health-implementation-principles"
                    className="block rounded-xl border border-slate-100 p-4 transition hover:border-teal-300 hover:bg-teal-50/30 dark:border-slate-800 dark:hover:border-slate-700"
                  >
                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Framework</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      Principles of Digital Health Implementation
                    </p>
                    <p className="mt-1 text-xs text-slate-500">8 min read • Change management & champions</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: INTEROPERABILITY */}
        <section className="py-20 md:py-24 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mb-12">
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Healthcare Standards
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                Making Healthcare Systems Work Together
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                Explore healthcare data exchange, international standards, terminology systems and interoperability technologies.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {standardBadges.map((badge) => (
                <div
                  key={badge.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="font-mono text-lg font-bold text-teal-700 dark:text-teal-400">{badge.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{badge.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/interoperability"
                className="inline-flex items-center gap-2 font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                Deep-dive into standards and data models →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: INTEROPMIND */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300 border border-teal-500/30">
                  Interactive Knowledge Environment
                </div>
                <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl md:text-5xl">
                  Explore InteropMind
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  An interactive space to explore health informatics concepts, healthcare technologies and interoperability.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/interopmind"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-8 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400 shadow-lg shadow-teal-500/20"
                  >
                    Explore InteropMind
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Interactive Capabilities</p>
                <ul className="mt-6 space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Explain complex HL7 v2 and FHIR mappings interactively.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Explore terminology relationships across SNOMED CT, LOINC, and ICD-10.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Evaluate clinical decision support pathways and CPOE safety checks.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>Prepare digital health implementation readiness checklists.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: COMMUNITY */}
        <section className="py-20 md:py-24 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 md:p-14 dark:border-slate-800 dark:bg-slate-900">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Professional Network
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                  Learn and Connect with the Health Informatics Community
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                  Connect with professionals interested in clinical informatics, healthcare interoperability and digital health transformation.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/community"
                    className="rounded-xl bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                  >
                    Visit Community Hub
                  </Link>
                  <Link
                    href="/people"
                    className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                  >
                    Discover Members
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: STREAM */}
        <section className="py-20 md:py-24 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Live Activity Feed
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                  What&apos;s Happening in the Community?
                </h2>
              </div>
              <Link
                href="/stream"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
              >
                Explore Stream
                <span>→</span>
              </Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          imageUrl={post.author.profileImage}
                          name={post.author.displayName || post.author.publicHandle}
                          className="h-9 w-9 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {post.author.displayName || 'Member'}
                          </p>
                          <p className="truncate text-xs text-slate-400">@{post.author.publicHandle}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-700 line-clamp-3 dark:text-slate-300">
                        {post.content}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="capitalize font-medium text-teal-600 dark:text-teal-400">#{post.topic}</span>
                      <span>{post.createdAtFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Follow live discussions, standards updates, and informatics insights on the Stream.
                </p>
                <Link
                  href="/stream"
                  className="mt-4 inline-block font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  Open Stream →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: FOOTER (rendered below) */}
      </main>

      <Footer />
    </div>
  )
}
