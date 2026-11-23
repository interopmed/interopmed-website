import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Clinical Informatics | InteropMed',
  description: 'Understanding clinical workflows, electronic medical records, clinical decision support, and human factors in digital healthcare.',
}

const topics = [
  {
    title: 'Clinical Workflow Optimisation',
    description: 'Analyzing clinical paths from patient triage to discharge. Reducing administrative friction, cognitive overload, and documentation bottlenecks.',
    tags: ['Workflows', 'Triage', 'Inpatient', 'Outpatient'],
  },
  {
    title: 'Electronic Medical Records (EMR)',
    description: 'Core architectural principles of clinical record keeping, longitudinal patient charts, problem lists, and encounters.',
    tags: ['EMR/EHR', 'Problem Lists', 'Longitudinal Care'],
  },
  {
    title: 'Computerized Provider Order Entry (CPOE)',
    description: 'Safe medication, laboratory, and radiology order communication with integrated clinical decision rules and formulary verification.',
    tags: ['CPOE', 'Orders', 'Safety Checks'],
  },
  {
    title: 'Clinical Decision Support (CDS)',
    description: 'Designing non-interruptive, context-aware alerts, clinical guidelines, and diagnostic support to prevent alert fatigue.',
    tags: ['CDS Hooks', 'Alert Fatigue', 'Safety'],
  },
  {
    title: 'Clinical Documentation & Handoffs',
    description: 'Balancing narrative clinical notes with structured data entry. Supporting structured physician-nurse communication and shift handoffs.',
    tags: ['Documentation', 'Handoffs', 'SBAR'],
  },
  {
    title: 'Human Factors & Ergonomics',
    description: 'Designing intuitive clinical user interfaces that adapt to high-stress, interrupt-driven hospital and clinic settings.',
    tags: ['Usability', 'Cognitive Load', 'Sociotechnical'],
  },
]

export default function ClinicalInformaticsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Pillar 01
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Connecting Clinical Practice with Digital Health
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Clinical informatics investigates the intersection of patient care, medical cognition, and information technology. We explore how digital systems can support healthcare professionals rather than impede their clinical judgment.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/articles/clinical-workflows-and-emr-architecture"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Read EMR Architecture Guide
                </Link>
                <Link
                  href="/interopmind"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                >
                  Explore in InteropMind
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Topics */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Key Domains in Clinical Informatics
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                Essential concepts for medical officers, clinical informaticians, and health system planners.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clinical Usability Callout */}
        <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl dark:from-slate-900 dark:to-teal-950 md:p-12">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Resource-Conscious Healthcare Delivery</p>
                <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Pragmatic Informatics for Real-World Hospitals
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  Whether operating in modern urban medical centers or district hospitals with intermittent connectivity, clinical systems must prioritize resilient local caching, minimal click-burden, and seamless handoffs.
                </p>
                <div className="mt-8 flex gap-4">
                  <Link
                    href="/articles"
                    className="rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
                  >
                    Browse Clinical Articles
                  </Link>
                  <Link
                    href="/community"
                    className="rounded-xl border border-slate-700 px-6 py-2.5 text-sm font-bold text-white transition hover:border-slate-500"
                  >
                    Join the Discussion
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
