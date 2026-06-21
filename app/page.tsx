import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SiteCTA from '@/components/SiteCTA'
import ProblemSolutionMatrix from '@/components/sections/ProblemSolutionMatrix'
import SecurityCompliance from '@/components/sections/SecurityCompliance'

export const metadata = {
  title: 'InteropMed - Connected Healthcare Technology Platform',
  description: 'Connecting healthcare data, devices, and smart hospital infrastructure with secure interoperability tools, AI guidance, and implementation support.',
}

const quickPaths = [
  {
    title: 'Request technical walkthrough',
    detail: 'Review your systems, devices, workflows, and integration constraints with InteropMed.',
    href: '/contact',
    action: 'Request review',
  },
  {
    title: 'Explore smart hospital integration',
    detail: 'Connect smart beds, OT lights, nurse-call systems, room sensors, and device telemetry.',
    href: '/smart-hospital',
    action: 'View page',
  },
  {
    title: 'Map clinical data workflows',
    detail: 'Plan EHR/EMR, LIS, device, wearable, and IoT data exchange across teams.',
    href: '/workflows',
    action: 'View workflows',
  },
]

const platformCapabilities = [
  {
    title: 'Connect',
    detail: 'Integrate EHR/EMR, LIS, imaging, monitoring devices, wearables, IoT sensors, and smart hospital systems.',
  },
  {
    title: 'Normalize',
    detail: 'Map legacy messages, device feeds, API payloads, and clinical workflow data into standards-aligned resources.',
  },
  {
    title: 'Govern',
    detail: 'Keep access, audit, exception review, and implementation decisions visible to accountable teams.',
  },
  {
    title: 'Operate',
    detail: 'Maintain connectors, alert routing, support workflows, and data-quality feedback after launch.',
  },
]

const communityFeatures = [
  'Public professional profiles with posts, insights, followers, and connections',
  'A public stream for standards, implementation, API, and security discussions',
  'Developer insights and articles for teams learning practical delivery patterns',
]

const developerLayer = [
  {
    title: 'Open-source utilities',
    detail: 'Reference helpers and examples for teams evaluating healthcare data exchange patterns.',
    href: '/open-source',
  },
  {
    title: 'Knowledge and learning',
    detail: 'Plain-language guidance for FHIR, HL7 v2, terminology, consent, APIs, and operations.',
    href: '/knowledge',
  },
  {
    title: 'API reference',
    detail: 'Endpoint structure and implementation principles for governed clinical data access.',
    href: '/api-reference',
  },
]

const aiGuidanceCapabilities = [
  'FHIR, HL7 v2, DICOM, C-CDA, terminology, and workflow guidance',
  'Architecture notes for secure clinical data exchange',
  'Implementation checklists, support triage, and practical next steps',
  'Privacy-aware guidance for clinical, security, and compliance decisions',
]

const flowSteps = [
  { step: 'Ingest', detail: 'Connect EHR, laboratory, imaging, monitoring device, wearable, IoT, smart bed, OT light, and partner feeds.' },
  { step: 'Normalize', detail: 'Transform source records into FHIR-aligned resources.' },
  { step: 'Govern', detail: 'Apply validation, access policy, audit, and review controls.' },
  { step: 'Publish', detail: 'Serve clean clinical context to dashboards, APIs, and analytics.' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white dark:bg-slate-950">
          <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:text-slate-300">
                  Healthcare technology platform
                </span>
              </div>
              <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] text-slate-950 dark:text-white md:text-7xl">
                Connecting healthcare data, devices, and smart hospital infrastructure.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                InteropMed helps healthcare organizations connect EHR/EMR systems, labs, monitoring devices, wearables, IoT, and smart hospital systems through secure, interoperable technology.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Request technical walkthrough
                </Link>
                <Link
                  href="/smart-hospital"
                  className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Smart hospital integration
                </Link>
              </div>
              <div className="mt-12 grid max-w-2xl gap-6 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-3">
                {[
                  { value: 'FHIR R4', label: 'resource alignment' },
                  { value: 'HL7 v2', label: 'legacy workflow mapping' },
                  { value: 'Governed', label: 'audit and policy design' },
                ].map((metric) => (
                  <div key={metric.value} className="border-l border-slate-200 pl-4 dark:border-slate-800">
                    <p className="text-2xl font-bold text-slate-950 dark:text-white">{metric.value}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">
                        Start here
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                        What do you want to do?
                      </h2>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      Start simple
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {quickPaths.map((path) => (
                      <Link
                        key={path.title}
                        href={path.href}
                        className="group grid gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:hover:border-teal-900 dark:hover:bg-teal-950/20 md:grid-cols-[0.78fr_1fr_auto]"
                      >
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{path.title}</p>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{path.detail}</p>
                        <p className="text-sm font-bold text-teal-700 transition group-hover:translate-x-1 dark:text-teal-300">
                          {path.action}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Link href="/stream" className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Connected care</p>
                    <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Device to record</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Route telemetry, lab results, and smart infrastructure signals into governed workflows.</p>
                  </Link>
                  <Link href="/insights" className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Developer insights</p>
                    <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Read articles</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Learn practical patterns for standards, governance, and operations.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProblemSolutionMatrix />

        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                  What you can do
                </p>
                <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
                  A clear path from fragmented systems to connected care.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Start with the workflow. Then connect the systems, normalize the data, govern the exchange, and keep the network healthy.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {platformCapabilities.map((item, index) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                  <p className="mb-5 font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
                Community
              </p>
              <h2 className="text-4xl font-bold md:text-5xl">
                A professional network for healthcare data teams.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Members can share implementation notes, follow peers, publish insights, and build a public profile around their work.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/stream"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Open Stream
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Community features
              </p>
              <div className="space-y-3">
                {communityFeatures.map((feature) => (
                  <div key={feature} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 dark:bg-slate-900 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                  Learning and tools
                </p>
                <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
                  Helpful resources before you are ready for production.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Start with practical knowledge, tooling, and examples. When the workflow needs reliability, move into implementation and managed operations.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {developerLayer.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-teal-300 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-900 dark:hover:shadow-black/20"
                >
                  <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                  <span className="mt-6 inline-block text-sm font-bold text-teal-700 dark:text-teal-300">
                    Explore
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
                AI guidance
              </p>
              <h2 className="text-4xl font-bold md:text-5xl">
                Get help understanding standards and next steps.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Ask questions about mappings, workflows, architecture choices, support requests, and compliance-sensitive decisions. Use the guidance as a starting point for expert review.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/interopmind"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Open AI workspace
                </Link>
                <Link
                  href="/ai-services"
                  className="rounded-lg border border-slate-700 px-7 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-teal-400 hover:text-teal-300"
                >
                  Explore AI services
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                AI can help with
              </p>
              <div className="space-y-3">
                {aiGuidanceCapabilities.map((capability) => (
                  <div key={capability} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {capability}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 text-slate-950 dark:bg-slate-950 dark:text-white md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">
                  Operating model
                </p>
                <h2 className="text-4xl font-bold md:text-5xl">
                  From source data to trusted clinical action.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Give integration, clinical, and governance teams a shared path for ingesting data, normalizing resources, applying policy, and publishing dependable APIs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {flowSteps.map((item, index) => (
                <article key={item.step} className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                  <p className="mb-5 font-mono text-sm text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-3 text-xl font-bold">{item.step}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/technology"
                className="inline-block rounded-lg border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                Explore the architecture
              </Link>
            </div>
          </div>
        </section>

        <SecurityCompliance />

        <SiteCTA
          eyebrow="Start planning"
          title="Ready to connect healthcare systems, devices, and smart infrastructure?"
          description="Bring your EHR/EMR, lab, device, wearable, IoT, or smart hospital workflow and we will help scope the integration model."
          primaryHref="/contact"
          primaryLabel="Request technical walkthrough"
          secondaryHref="/smart-hospital"
          secondaryLabel="Explore smart hospital"
        />
      </main>
      <Footer />
    </>
  )
}
