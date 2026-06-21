import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Interoperability Workflows | InteropMed',
  description: 'Healthcare interoperability workflow playbooks for FHIR APIs, HL7 v2 migration, referrals, ADT routing, lab exchange, consent, and care coordination.',
}

const workflows = [
  {
    title: 'FHIR API implementation',
    standard: 'FHIR R4',
    audience: 'Architects, API teams',
    detail: 'Plan resource scope, authentication, search, validation, test data, and production rollout for a governed FHIR API.',
    steps: ['Define resource contracts', 'Select security model', 'Validate profiles', 'Publish and monitor'],
  },
  {
    title: 'HL7 v2 to FHIR migration',
    standard: 'HL7 v2 + FHIR',
    audience: 'Interface teams',
    detail: 'Transform ADT, ORM, ORU, and SIU feeds into reliable FHIR resources without losing operational context.',
    steps: ['Inventory messages', 'Map segments', 'Handle exceptions', 'Run parallel validation'],
  },
  {
    title: 'ADT event routing',
    standard: 'HL7 v2 ADT',
    audience: 'Operations, EHR teams',
    detail: 'Route admission, discharge, transfer, registration, and demographic changes to downstream systems safely.',
    steps: ['Classify triggers', 'Match patients', 'Filter subscribers', 'Audit delivery'],
  },
  {
    title: 'Lab result exchange',
    standard: 'ORU + Observation',
    audience: 'Labs, clinicians',
    detail: 'Move lab orders and results through terminology mapping, abnormal flags, provenance, and clinical review paths.',
    steps: ['Map LOINC', 'Normalize units', 'Validate ranges', 'Notify consumers'],
  },
  {
    title: 'Consent-aware access',
    standard: 'SMART + policy',
    audience: 'Security, compliance',
    detail: 'Design access workflows that respect consent, purpose of use, scopes, roles, and audit expectations.',
    steps: ['Capture policy', 'Bind scopes', 'Evaluate access', 'Review audit trail'],
  },
  {
    title: 'Referral coordination',
    standard: 'ServiceRequest',
    audience: 'Clinical operations',
    detail: 'Coordinate referrals across organizations with status tracking, documents, scheduling, and response loops.',
    steps: ['Create request', 'Attach context', 'Track status', 'Close the loop'],
  },
]

const checklist = [
  'Actors and systems are named.',
  'Data exchanged is listed at field or resource level.',
  'Standards and implementation guides are identified.',
  'Security, consent, and audit requirements are explicit.',
  'Testing and exception handling are planned before launch.',
]

export default function WorkflowsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Workflow library
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
              Step-by-step playbooks for healthcare interoperability work.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Start with the workflow your team needs to implement, then connect the process to standards, data contracts, validation, governance, and launch readiness.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/learn" className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                Learn the standards
              </Link>
              <Link href="/tools" className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300">
                Use workflow tools
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workflows.map((workflow) => (
                <article key={workflow.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
                      {workflow.standard}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {workflow.audience}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">{workflow.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{workflow.detail}</p>
                  <div className="mt-5 space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                        <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{step}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Workflow checklist</p>
                <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">A good playbook is implementation-ready.</h2>
                <div className="mt-6 space-y-3">
                  {checklist.map((item) => (
                    <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-teal-200 bg-white p-6 dark:border-teal-900 dark:bg-slate-950 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Need a custom workflow?</p>
                <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Turn a local process into a reusable interoperability playbook.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  Bring your exchange scenario, source systems, standards, and operational constraints. InteropMed can help translate them into workflow steps, data maps, and validation checkpoints.
                </p>
                <Link href="/contact" className="mt-6 inline-block rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                  Request workflow review
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
