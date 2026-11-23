import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Digital Health Implementation | InteropMed',
  description: 'Evidence-based guidance on EMR implementation, clinical workflow assessment, change management, user training, and digital health governance.',
}

const phases = [
  {
    step: 'Phase 01',
    title: 'Pre-Implementation Assessment',
    description: 'Documenting existing manual paper trails, bedside handoffs, and clinic bottlenecks. Establishing clear clinical KPIs before software customization.',
    items: ['Stakeholder alignment', 'Process mapping', 'Baseline metrics', 'Infrastructure readiness'],
  },
  {
    step: 'Phase 02',
    title: 'Clinical Architecture & Configuration',
    description: 'Aligning data entry forms with clinical guidelines. Establishing standard order sets and minimizing intrusive alert interruptions.',
    items: ['Terminology mapping', 'CDS rule design', 'Security & role boundaries', 'Integration testing'],
  },
  {
    step: 'Phase 03',
    title: 'Change Leadership & Clinician Training',
    description: 'Cultivating clinical super-users and department champions. Conducting scenario-based simulation training rather than abstract feature tours.',
    items: ['Super-user network', 'Role-tailored labs', 'Simulation runs', 'Cutover schedule'],
  },
  {
    step: 'Phase 04',
    title: 'Phased Go-Live & Post-Go-Live Optimization',
    description: 'Executing departmental pilot cutovers, providing at-the-elbow clinical floor support, and iterating on clinician feedback loops.',
    items: ['At-the-elbow support', 'Incident triage', 'Adoption tracking', 'Workflow refinement'],
  },
]

export default function ImplementationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Pillar 03
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Digital Health Implementation & Governance
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Deploying digital health systems is primarily a clinical and human transformation endeavor. We provide pragmatic strategies for change management, clinician adoption, workflow alignment, and governance.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/articles/digital-health-implementation-principles"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Read Implementation Principles
                </Link>
                <Link
                  href="/interopmind"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                >
                  Plan Project in InteropMind
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Phases */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Implementation Lifecycle
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                A disciplined four-phase approach to hospital digitalisation and digital health modernization.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {phases.map((p) => (
                <div
                  key={p.step}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{p.step}</span>
                    <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{p.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{p.description}</p>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deliverables</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.items.map((it) => (
                        <span key={it} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Change Management Callout */}
        <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950 md:p-12">
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                Overcoming Implementation Hurdles
              </h3>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Explore practical strategies for managing physician resistance, organizing hospital informatics committees, defining data governance policies, and conducting system evaluations.
              </p>
              <div className="mt-6">
                <Link
                  href="/articles/digital-health-implementation-principles"
                  className="inline-flex items-center gap-2 font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                >
                  Read the complete implementation framework →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
