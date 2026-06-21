import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SiteCTA from '@/components/SiteCTA'

export const metadata = {
  title: 'Solutions | InteropMed',
  description: 'InteropMed solution areas for EHR/EMR, lab systems, monitoring devices, wearables, healthcare IoT, smart hospital infrastructure, AI workflows, and professional knowledge sharing.',
}

const solutionAreas = [
  {
    title: 'EHR/EMR Connectivity',
    audience: 'Hospitals, clinics, care teams',
    detail: 'Connect patient records, visits, referrals, prescriptions, documents, and clinical workflow exchange.',
  },
  {
    title: 'Laboratory System Integration',
    audience: 'Labs, diagnostics, clinicians',
    detail: 'Support LIS workflows, lab orders, results, analyzer feeds, abnormal flags, units, and terminology mapping.',
  },
  {
    title: 'Monitoring Device Data',
    audience: 'ICU, wards, remote monitoring teams',
    detail: 'Move supported bedside monitor, ICU telemetry, and remote monitoring signals into review workflows.',
  },
  {
    title: 'Wearables And Remote Care',
    audience: 'Home care, RPM, chronic care programs',
    detail: 'Turn wearable and home-care observations into longitudinal patient context instead of isolated readings.',
  },
  {
    title: 'Healthcare IoT',
    audience: 'Operations, facilities, digital teams',
    detail: 'Connect room sensors, environmental data, occupancy, equipment status, and operational healthcare IoT signals.',
  },
  {
    title: 'Smart Hospital Infrastructure',
    audience: 'Smart hospital and OT teams',
    detail: 'Bring smart beds, OT lights, nurse-call systems, room sensors, and connected equipment into usable workflows.',
  },
  {
    title: 'AI-Assisted Workflows',
    audience: 'Integration, support, product teams',
    detail: 'Assist mapping, workflow planning, support triage, documentation, and architecture review under human approval.',
  },
  {
    title: 'Professional Stream',
    audience: 'Interop professionals and partners',
    detail: 'A built-in knowledge layer for profiles, posts, insights, follows, and practical healthcare interoperability discussions.',
  },
]

const workflowSteps = [
  {
    step: 'Discover',
    detail: 'Understand the systems, data sources, workflows, interfaces, and constraints.',
  },
  {
    step: 'Map',
    detail: 'Translate records, results, device signals, and operational events into a clear data model.',
  },
  {
    step: 'Govern',
    detail: 'Plan access, audit, privacy, validation, human review, and deployment boundaries.',
  },
  {
    step: 'Pilot',
    detail: 'Test a narrow workflow using synthetic, sandbox, or non-PHI data where possible.',
  },
]

const boundaries = [
  'Focused on the software and integration layer for connected healthcare.',
  'Designed around existing clinical systems, labs, devices, wearables, IoT, and hospital infrastructure.',
  'Built around collaboration, workflow discovery, governance, and practical pilot planning.',
]

export default function SolutionsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-16 dark:bg-slate-950 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Solutions
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
                A simple map of what InteropMed focuses on.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                InteropMed is designed as a technology layer for healthcare data, clinical systems, lab workflows, devices, wearables, IoT, smart hospital infrastructure, AI-assisted workflows, and professional knowledge sharing.
              </p>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Discuss collaboration
                </Link>
                <Link
                  href="/stream"
                  className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  View professional stream
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Simple idea
              </p>
              <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
                Healthcare already has systems, devices, and data.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                The missing piece is a practical software layer that helps them communicate, stay governed, and become useful inside real workflows.
              </p>
              <div className="mt-6 grid gap-3">
                {boundaries.map((boundary) => (
                  <div key={boundary} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    {boundary}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Solution areas
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                Eight focus areas, one connected direction.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                These areas guide architecture, partner conversations, workflow discovery, and practical implementation planning.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {solutionAreas.map((solution, index) => (
                <article key={solution.title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{solution.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {solution.audience}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{solution.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 dark:bg-slate-950 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                  Pilot path
                </p>
                <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                  Start narrow, learn quickly, reduce risk.
                </h2>
              </div>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                The clearest path is to validate one workflow, one data source, and one operational goal before expanding the integration.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {workflowSteps.map((item, index) => (
                <article key={item.step} className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{item.step}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SiteCTA
          eyebrow="Collaboration"
          title="Have a healthcare integration problem worth exploring?"
          description="Share the workflow, system, device, lab, wearable, IoT, or smart hospital challenge. InteropMed can use it to shape the roadmap and implementation direction."
          primaryHref="/contact"
          primaryLabel="Discuss collaboration"
          secondaryHref="/smart-hospital"
          secondaryLabel="Smart hospital vision"
        />
      </main>
      <Footer />
    </>
  )
}
