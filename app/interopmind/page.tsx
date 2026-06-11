import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SiteCTA from '@/components/SiteCTA'

export const metadata = {
  title: 'InteropMind AI | Healthcare Interoperability AI',
  description:
    'InteropMind AI is a healthcare interoperability engine for FHIR, HL7, DICOM, clinical API architecture, compliance, and secure data exchange.',
}

const capabilities = [
  {
    title: 'Standards-aware implementation',
    detail:
      'Generate FHIR-aligned payloads, HL7 v2 mappings, API contracts, validation rules, and integration workflows with version risk called out early.',
  },
  {
    title: 'Architecture review',
    detail:
      'Evaluate SaaS-first interoperability topologies using gateways, queues, webhooks, serverless processing, managed databases, and secure cloud endpoints.',
  },
  {
    title: 'Compliance-by-design guidance',
    detail:
      'Fold PHI safety, audit trails, RBAC, ABAC, consent, de-identification, tokenization, and retention decisions into implementation planning.',
  },
]

const standards = [
  'HL7 FHIR R4, R4B, and R5',
  'HL7 v2 ADT, ORU, ORM, and MLLP workflows',
  'DICOMweb WADO-RS, QIDO-RS, and STOW-RS',
  'CDA and C-CDA document structures',
  'US Core, ONC Cures Act, HIPAA, and HITECH',
]

const workflows = [
  {
    step: 'Inspect',
    detail: 'Classify source payloads, workflow intent, standards version, identifiers, consent context, and integration risk.',
  },
  {
    step: 'Map',
    detail: 'Convert brittle feeds into FHIR-aligned resources with explicit transformation logic and validation boundaries.',
  },
  {
    step: 'Govern',
    detail: 'Apply access policy, audit logging, PHI minimization, error review, and release controls before production exchange.',
  },
  {
    step: 'Operate',
    detail: 'Use event-driven monitoring, retry paths, exception queues, and managed connector updates to keep exchanges reliable.',
  },
]

const mappingRows = [
  {
    source: 'PID-3',
    logic: 'Normalize assigning authority and identifier type; reject empty or ambiguous patient identifiers.',
    target: 'Patient.identifier',
  },
  {
    source: 'PID-5',
    logic: 'Split family and given names; preserve original text when source formatting is uncertain.',
    target: 'Patient.name',
  },
  {
    source: 'PV1-2',
    logic: 'Map patient class to an Encounter class code using an approved terminology table.',
    target: 'Encounter.class',
  },
]

export default function InteropMindPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                InteropMind AI
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl">
                Healthcare interoperability guidance built into the product workflow.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                InteropMind gives InteropMed a standards-aware advisory layer for FHIR, HL7, DICOM, clinical API architecture, and compliance-sensitive implementation decisions.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/account/insights"
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25"
                >
                  Open AI workspace
                </Link>
                <Link
                  href="/contact"
                  className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Request architecture review
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      InteropMind run
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      ADT to FHIR review
                    </h2>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    PHI safe
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    'Version risk: confirm HL7 v2.3 vs v2.5.1 before final mapping.',
                    'Target resources: Patient, Encounter, Organization, Practitioner.',
                    'Controls: synthetic examples only, RBAC scopes, audit event capture.',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 dark:bg-slate-900 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                What it does
              </p>
              <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
                Opinionated help for the decisions that slow interoperability teams down.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {capabilities.map((capability) => (
                <article
                  key={capability.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8"
                >
                  <h3 className="mb-3 text-2xl font-bold text-slate-950 dark:text-white">
                    {capability.title}
                  </h3>
                  <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                    {capability.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Standards coverage
              </p>
              <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
                Built around real clinical exchange standards.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {standards.map((standard) => (
                <div
                  key={standard}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {standard}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
                  Workflow
                </p>
                <h2 className="text-4xl font-bold md:text-5xl">
                  From ambiguous source data to governed exchange.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                InteropMind is designed to support implementation work where standards ambiguity, PHI safety, terminology, and operational reliability all matter at the same time.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {workflows.map((workflow, index) => (
                <article key={workflow.step} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                  <p className="mb-5 font-mono text-sm text-teal-300">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-3 text-xl font-bold">{workflow.step}</h3>
                  <p className="text-sm leading-6 text-slate-400">{workflow.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Mapping discipline
              </p>
              <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
                Every transformation should be explainable.
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="grid gap-4 bg-slate-100 p-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-900 dark:text-slate-400 md:grid-cols-[0.45fr_1.25fr_0.7fr]">
                <span>Source field</span>
                <span>Transformation logic</span>
                <span>Target FHIR element</span>
              </div>
              {mappingRows.map((row) => (
                <div
                  key={row.source}
                  className="grid gap-4 border-t border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[0.45fr_1.25fr_0.7fr]"
                >
                  <span className="font-mono font-semibold text-teal-700 dark:text-teal-300">{row.source}</span>
                  <span className="text-slate-600 dark:text-slate-300">{row.logic}</span>
                  <span className="font-mono text-slate-950 dark:text-white">{row.target}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteCTA
          eyebrow="InteropMind review"
          title="Turn the Gem prompt into a product capability."
          description="Use InteropMind to review InteropMed positioning, integration architecture, FHIR mappings, and compliance-sensitive implementation plans."
          primaryHref="/account/insights"
          primaryLabel="Open AI workspace"
          secondaryHref="/contact"
          secondaryLabel="Request review"
        />
      </main>
      <Footer />
    </>
  )
}
