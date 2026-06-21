import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Interoperability Tools | InteropMed',
  description: 'Hands-on interoperability tools for FHIR exploration, HL7 parsing, mapping, profile validation, terminology lookup, and readiness assessment.',
}

const tools = [
  {
    title: 'FHIR resource explorer',
    status: 'Available pattern',
    detail: 'Browse common resources, fields, references, search parameters, and implementation notes.',
  },
  {
    title: 'HL7 v2 message parser',
    status: 'Available pattern',
    detail: 'Inspect message types, segments, trigger events, and candidate FHIR mappings.',
  },
  {
    title: 'Profile validation checklist',
    status: 'Build next',
    detail: 'Check examples against profile expectations, required fields, terminology, and cardinality.',
  },
  {
    title: 'Mapping assistant',
    status: 'Build next',
    detail: 'Draft source-to-target mappings for common clinical exchange payloads.',
  },
  {
    title: 'Terminology lookup',
    status: 'Build next',
    detail: 'Find coding systems, value set usage, local code gaps, and normalization notes.',
  },
  {
    title: 'Implementation readiness assessment',
    status: 'Build next',
    detail: 'Score workflow readiness across data, standards, security, testing, operations, and governance.',
  },
]

const toolFlow = ['Paste or select payload', 'Parse structure', 'Map standards', 'Validate rules', 'Export checklist']

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Tools
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
              Hands-on utilities for interoperability implementation.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Tools make the hub practical: parse messages, inspect resources, validate examples, build mappings, and turn workflow decisions into launch checklists.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <article key={tool.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tool.status}
                  </span>
                  <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">{tool.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{tool.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Tool workflow</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Every tool should move users closer to implementation.</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                    The best tools do not stop at inspection. They help users understand, validate, and export the next action.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  {toolFlow.map((step, index) => (
                    <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">{String(index + 1).padStart(2, '0')}</p>
                      <p className="mt-3 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-200">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-lg border border-teal-200 bg-white p-6 dark:border-teal-900 dark:bg-slate-950 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Developer layer</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Connect tools with docs and open-source utilities.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/open-source" className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300">
                    Open source
                  </Link>
                  <Link href="/api-reference" className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                    API reference
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
