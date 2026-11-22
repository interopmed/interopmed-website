import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { getAccountSessionUser } from '@/lib/account-auth'

export const metadata = {
  title: 'InteropMed Community | Health Informatics Knowledge Exchange',
  description: 'Connect with healthcare professionals, clinical informaticians, researchers, and developers exploring health informatics and interoperability.',
}

export const dynamic = 'force-dynamic'

const communityPillars = [
  {
    title: 'Knowledge Sharing',
    description: 'Exchange real-world insights on electronic medical records, clinical workflow bottlenecks, and standards adoption across healthcare environments.',
  },
  {
    title: 'Standards & Architecture',
    description: 'Discuss practical HL7 FHIR implementation, terminology mapping strategies (SNOMED, LOINC), and clinical decision support integration.',
  },
  {
    title: 'Peer Connections',
    description: 'Collaborate with medical doctors, health informaticians, hospital IT administrators, and software developers across the globe.',
  },
]

const participationGuidelines = [
  {
    rule: 'Prioritize Clinical & Technical Accuracy',
    detail: 'Share evidence-based perspectives, verified standards citations, and practical lessons from real deployments.',
  },
  {
    rule: 'Maintain Patient Privacy & Confidentiality',
    detail: 'Never post identifiable patient data, restricted clinical records, or proprietary non-public institutional information.',
  },
  {
    rule: 'Foster Constructive & Professional Dialogue',
    detail: 'Encourage inquiry from newcomers and respect diverse clinical contexts, especially resource-constrained healthcare environments.',
  },
]

export default async function CommunityPage() {
  const viewer = await getAccountSessionUser()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Professional Community
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                InteropMed Community
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Connect with professionals exploring health informatics, clinical information systems, healthcare interoperability and digital health.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/stream"
                  className="rounded-xl bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Go to Live Stream Feed →
                </Link>
                {!viewer && (
                  <Link
                    href="/account/register"
                    className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                  >
                    Join the Network
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Community Purpose */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Why Join the InteropMed Community?
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                A collaborative space dedicated to advancing healthcare delivery through open standards and clinical informatics.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {communityPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Distinction Callout: Community vs Stream */}
        <section className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Live Interactions
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                  Explore the Stream Activity Feed
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  While this Community page introduces our principles and focus areas, the <strong>Stream</strong> is our live activity feed where practitioners publish updates, ask technical questions, discuss implementation challenges, and comment on clinical topics in real-time.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/stream"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    Open Live Stream Feed
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/people"
                    className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                  >
                    Discover People
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">Community Participation Guidelines</h3>
                <div className="mt-4 space-y-4">
                  {participationGuidelines.map((g, idx) => (
                    <div key={idx} className="border-t border-slate-200 pt-3 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{g.rule}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{g.detail}</p>
                    </div>
                  ))}
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
