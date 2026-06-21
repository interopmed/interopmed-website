import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SiteCTA from '@/components/SiteCTA'

export const metadata = {
  title: 'Smart Hospital IoT Integration | InteropMed',
  description: 'InteropMed connects smart beds, OT lights, nurse-call systems, monitors, wearables, IoT sensors, and hospital infrastructure into governed healthcare workflows.',
}

const connectedSystems = [
  {
    title: 'AI + IoT beds',
    detail: 'Integrate smart bed status, occupancy, risk indicators, movement signals, and maintenance events where supported by device interfaces.',
  },
  {
    title: 'Operating theatre systems',
    detail: 'Connect OT lights, theatre status, scheduling context, equipment readiness, and perioperative workflow signals.',
  },
  {
    title: 'Nurse-call and alerting',
    detail: 'Route calls, escalations, room signals, and care-team notifications into auditable operational workflows.',
  },
  {
    title: 'Patient monitoring telemetry',
    detail: 'Ingest bedside and remote monitoring observations for dashboards, alerts, charting support, and data-quality review.',
  },
  {
    title: 'Room and environment sensors',
    detail: 'Use temperature, humidity, air quality, occupancy, and infection-control signals for operational visibility.',
  },
  {
    title: 'Connected equipment operations',
    detail: 'Track status, exceptions, utilization, and maintenance indicators for supported hospital equipment.',
  },
]

const integrationFlow = [
  'Connect supported device or infrastructure interface',
  'Normalize events, observations, and status signals',
  'Apply access, audit, governance, and routing rules',
  'Publish alerts, dashboards, APIs, and workflow updates',
]

const boundaries = [
  'InteropMed does not manufacture medical devices or hospital equipment.',
  'InteropMed provides the software, integration, governance, and AI-assisted workflow layer.',
  'Clinical, compliance, and production decisions remain under accountable human review.',
]

export default function SmartHospitalPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Smart hospital IoT
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl">
                Connect smart hospital infrastructure to clinical workflows.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                InteropMed connects smart beds, OT lights, nurse-call systems, patient monitors, wearables, IoT sensors, and operational equipment signals into one governed interoperability layer.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Request technical walkthrough
                </Link>
                <Link
                  href="/technology"
                  className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Explore architecture
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Integration model
              </p>
              <div className="space-y-3">
                {integrationFlow.map((step, index) => (
                  <div key={step} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[auto_1fr]">
                    <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                What can connect
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white md:text-5xl">
                Make connected equipment operationally useful.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {connectedSystems.map((system) => (
                <article key={system.title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">{system.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{system.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
                Technology provider
              </p>
              <h2 className="text-3xl font-bold md:text-5xl">
                We connect the equipment. We do not manufacture it.
              </h2>
            </div>
            <div className="grid gap-3">
              {boundaries.map((boundary) => (
                <div key={boundary} className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm font-semibold leading-6 text-slate-300">
                  {boundary}
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteCTA
          eyebrow="Smart hospital planning"
          title="Have device, IoT, or infrastructure signals you need to connect?"
          description="Bring the systems, interfaces, data sources, and operational goals. InteropMed can help scope the integration path."
          primaryHref="/contact"
          primaryLabel="Request walkthrough"
          secondaryHref="/solutions"
          secondaryLabel="View solutions"
        />
      </main>
      <Footer />
    </>
  )
}
