import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'AI-Managed Interoperability Services | InteropMed',
  description: 'AI-managed healthcare interoperability services for workflows, education, knowledge, tools, implementation, monitoring, and support.',
}

const managedServices = [
  {
    title: 'Workflow orchestration',
    detail: 'AI helps identify the right workflow, sequence tasks, surface required standards, and generate implementation checklists.',
    scope: ['FHIR API rollout', 'HL7 migration', 'ADT routing', 'Referral coordination'],
  },
  {
    title: 'Education guidance',
    detail: 'AI recommends learning paths based on user role, workflow, standards experience, and implementation stage.',
    scope: ['FHIR basics', 'HL7 v2 reading', 'Security and consent', 'Terminology'],
  },
  {
    title: 'Knowledge navigation',
    detail: 'AI turns standards and documentation into plain-language answers with links back to workflows, tools, and references.',
    scope: ['Glossary', 'Mapping rules', 'Architecture patterns', 'Compliance notes'],
  },
  {
    title: 'Tool assistance',
    detail: 'AI guides users through parsers, validators, mapping assistants, and readiness assessments without hiding validation evidence.',
    scope: ['FHIR explorer', 'HL7 parser', 'Profile checklist', 'Mapping assistant'],
  },
  {
    title: 'Implementation support',
    detail: 'AI drafts architecture reviews, identifies risks, prepares meeting notes, and keeps implementation plans aligned to standards.',
    scope: ['Architecture review', 'Launch plan', 'Risk register', 'Operational handoff'],
  },
  {
    title: 'Managed operations',
    detail: 'AI summarizes exceptions, classifies support requests, detects recurring issues, and prepares human-reviewed remediation actions.',
    scope: ['Exception triage', 'Connector maintenance', 'Data quality reports', 'Support routing'],
  },
]

const operatingLoop = [
  {
    step: 'Understand',
    detail: 'Collect workflow intent, systems involved, data exchanged, standards, constraints, and user role.',
  },
  {
    step: 'Recommend',
    detail: 'Suggest the best workflow, learning path, tool, checklist, or implementation package.',
  },
  {
    step: 'Assist',
    detail: 'Generate mappings, summaries, test plans, knowledge answers, and operational notes with traceable context.',
  },
  {
    step: 'Validate',
    detail: 'Run rules, check completeness, flag uncertainty, and separate AI suggestions from verified facts.',
  },
  {
    step: 'Escalate',
    detail: 'Route high-risk, clinical, security, compliance, and production decisions to accountable human review.',
  },
]

const guardrails = [
  'AI suggestions must show the workflow, standard, or data source they are based on.',
  'Production changes require human approval before deployment or customer-facing action.',
  'PHI-sensitive workflows should use minimization, redaction, access control, and audit logging.',
  'Clinical, legal, and compliance outputs are decision support, not unchecked final authority.',
  'Every automated action should leave an audit trail and rollback path.',
]

export default function AiServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-16 dark:bg-slate-950 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                AI-managed services
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
                Run the interoperability hub with AI-assisted management.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                InteropMed can use AI to coordinate workflows, education, knowledge, tools, implementation support, and managed operations while keeping high-risk healthcare decisions under human review.
              </p>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Link href="/account/insights" className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                  Open AI workspace
                </Link>
                <Link href="/contact" className="rounded-lg border border-slate-300 px-7 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300">
                  Plan managed services
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                AI operating layer
              </p>
              <div className="mt-5 grid gap-3">
                {operatingLoop.map((item, index) => (
                  <div key={item.step} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[0.18fr_0.28fr_1fr]">
                    <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white">{item.step}</span>
                    <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</span>
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
                Service coverage
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                One AI layer across the whole hub.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {managedServices.map((service) => (
                <article key={service.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.scope.map((item) => (
                      <span key={item} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 dark:bg-slate-950 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                Safety model
              </p>
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                AI can manage the work, but humans approve the risk.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                Healthcare interoperability includes clinical, privacy, compliance, and production risks. The AI layer should accelerate decisions while keeping evidence, auditability, and human accountability intact.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8">
              <div className="space-y-3">
                {guardrails.map((guardrail) => (
                  <div key={guardrail} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    {guardrail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-14 text-white md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
                  Next step
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  Start by connecting AI to one workflow and one support process.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  The strongest path is to pilot AI management on FHIR API implementation or HL7 migration, then expand into support triage, knowledge routing, and managed operations.
                </p>
              </div>
              <Link href="/contact" className="w-fit rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-7 py-3 text-center text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                Plan AI-managed pilot
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
