import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Interoperability Knowledge Base | InteropMed',
  description: 'A healthcare interoperability knowledge base for standards, terminology, data mapping, architecture patterns, compliance, and implementation decisions.',
}

const knowledgeAreas = [
  {
    title: 'Standards reference',
    detail: 'FHIR resources, HL7 v2 messages, SMART on FHIR, C-CDA, implementation guides, and conformance notes.',
    examples: ['FHIR Resource', 'HL7 segment', 'ImplementationGuide'],
  },
  {
    title: 'Mapping patterns',
    detail: 'Field-level guidance for moving legacy payloads into FHIR resources while preserving meaning and provenance.',
    examples: ['PID to Patient', 'OBX to Observation', 'PV1 to Encounter'],
  },
  {
    title: 'Architecture decisions',
    detail: 'Reusable patterns for event routing, API gateways, consent checks, audit trails, and operational monitoring.',
    examples: ['Event bus', 'Gateway', 'Audit pipeline'],
  },
  {
    title: 'Compliance notes',
    detail: 'Plain-language notes for privacy, security, consent, minimum necessary access, and implementation risk.',
    examples: ['Purpose of use', 'Role policy', 'Access review'],
  },
]

const glossary = [
  ['FHIR Profile', 'A constraint on a FHIR resource for a specific implementation need.'],
  ['Value Set', 'A curated group of codes allowed for a field or clinical concept.'],
  ['ADT', 'HL7 v2 admission, discharge, and transfer messages used for patient movement events.'],
  ['SMART on FHIR', 'An app authorization pattern using OAuth scopes with FHIR APIs.'],
  ['Provenance', 'Metadata that explains where data came from and how it changed.'],
]

export default function KnowledgePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Knowledge base
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
              Answers, definitions, and patterns for interoperability decisions.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Use the knowledge base to connect standards vocabulary with real implementation choices: mapping, architecture, compliance, testing, and operations.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-5 md:grid-cols-2">
              {knowledgeAreas.map((area) => (
                <article key={area.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-8">
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{area.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{area.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {area.examples.map((example) => (
                      <span key={example} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {example}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Glossary starter</p>
                <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
                  {glossary.map(([term, definition]) => (
                    <div key={term} className="grid gap-2 py-4 md:grid-cols-[0.35fr_1fr]">
                      <p className="font-bold text-slate-950 dark:text-white">{term}</p>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{definition}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-teal-200 bg-white p-6 dark:border-teal-900 dark:bg-slate-950 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Knowledge to action</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Pair every answer with a workflow or tool.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  The knowledge base should never be a static encyclopedia. Each concept should lead users toward a playbook, validator, parser, checklist, or implementation guide.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/workflows" className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300">
                    Workflows
                  </Link>
                  <Link href="/tools" className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                    Tools
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
