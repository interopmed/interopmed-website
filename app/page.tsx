import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SiteCTA from '@/components/SiteCTA'
import ProblemSolutionMatrix from '@/components/sections/ProblemSolutionMatrix'

export const metadata = {
  title: 'InteropMed - Connected Healthcare Technology',
  description: 'A healthcare technology initiative for connected clinical systems, labs, devices, IoT, smart hospital infrastructure, and interoperability knowledge sharing.',
}

const primaryPaths = [
  {
    title: 'Solution areas',
    detail: 'See the healthcare workflows InteropMed is focused on.',
    href: '/solutions',
    action: 'View solutions',
  },
  {
    title: 'Smart hospital',
    detail: 'Explore connected beds, OT lights, IoT, monitors, and infrastructure.',
    href: '/smart-hospital',
    action: 'View smart hospital',
  },
  {
    title: 'Professional stream',
    detail: 'Follow posts, insights, and interoperability discussions.',
    href: '/stream',
    action: 'Open stream',
  },
]

const focusAreas = [
  {
    title: 'Clinical systems',
    detail: 'EHR/EMR records, referrals, visits, documents, and clinical workflow data.',
  },
  {
    title: 'Labs and diagnostics',
    detail: 'LIS workflows, lab orders, results, analyzers, units, and terminology.',
  },
  {
    title: 'Devices and IoT',
    detail: 'Monitoring devices, wearables, room sensors, equipment status, and telemetry.',
  },
  {
    title: 'Smart hospital workflows',
    detail: 'Smart beds, OT lights, nurse-call systems, room signals, and operational context.',
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white dark:bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Connected healthcare technology
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-950 dark:text-white">
                One clearer layer for healthcare systems, devices, and data.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                InteropMed focuses on the software layer between clinical systems, labs, monitoring devices, wearables, IoT, smart hospital infrastructure, and the people who need to understand that data.
              </p>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/solutions"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  View solution areas
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Discuss collaboration
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Start here
                </p>
                <div className="grid gap-3">
                  {primaryPaths.map((path) => (
                    <Link
                      key={path.title}
                      href={path.href}
                      className="group grid gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:hover:border-teal-900 dark:hover:bg-teal-950/20 md:grid-cols-[0.55fr_1fr_auto]"
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
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Focus
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                Four simple areas.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {focusAreas.map((area, index) => (
                <article key={area.title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{area.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{area.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProblemSolutionMatrix />

        <section className="bg-white py-14 dark:bg-slate-950 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Knowledge network
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                A focused stream for interoperability work.
              </h2>
            </div>
            <div>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                InteropMed also includes a professional stream for posts, insights, profiles, follows, and practical discussions around healthcare data, standards, implementation, and connected-care ideas.
              </p>
              <Link
                href="/stream"
                className="mt-6 inline-block rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                Open stream
              </Link>
            </div>
          </div>
        </section>

        <SiteCTA
          eyebrow="Collaboration"
          title="Have a healthcare integration challenge worth exploring?"
          description="Share the workflow, system, device, lab, wearable, IoT, or smart hospital problem. InteropMed can use it to shape the roadmap and future pilot direction."
          primaryHref="/contact"
          primaryLabel="Discuss collaboration"
          secondaryHref="/solutions"
          secondaryLabel="View solutions"
        />
      </main>
      <Footer />
    </>
  )
}
