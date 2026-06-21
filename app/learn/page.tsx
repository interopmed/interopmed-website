import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Learn Healthcare Interoperability | InteropMed',
  description: 'Practical education paths for FHIR, HL7 v2, terminology, consent, SMART on FHIR, APIs, validation, and healthcare interoperability architecture.',
}

const learningPaths = [
  {
    level: 'Beginner',
    title: 'Interoperability foundations',
    detail: 'Understand why clinical data exchange is difficult, how systems communicate, and where standards help.',
    lessons: ['Actors and workflows', 'Data types and clinical context', 'Common integration patterns'],
  },
  {
    level: 'Beginner',
    title: 'FHIR essentials',
    detail: 'Learn resources, references, search, bundles, profiles, and implementation guide basics.',
    lessons: ['Patient and Encounter', 'Observation and DiagnosticReport', 'Search and REST patterns'],
  },
  {
    level: 'Intermediate',
    title: 'HL7 v2 in practice',
    detail: 'Read ADT, ORM, ORU, and SIU message structures and map events into modern workflows.',
    lessons: ['Segments and fields', 'Trigger events', 'Message-to-resource mapping'],
  },
  {
    level: 'Intermediate',
    title: 'Terminology and coding',
    detail: 'Use LOINC, SNOMED CT, ICD, CPT, RxNorm, local codes, value sets, and normalization strategies.',
    lessons: ['Code systems', 'Value sets', 'Local code governance'],
  },
  {
    level: 'Advanced',
    title: 'Security and consent',
    detail: 'Apply scopes, roles, policy, purpose of use, audit, and consent-aware access to exchange workflows.',
    lessons: ['SMART on FHIR', 'OAuth and scopes', 'Audit and consent checks'],
  },
  {
    level: 'Advanced',
    title: 'Implementation guide readiness',
    detail: 'Move from standards reading to conformance, testing, validation, and production operations.',
    lessons: ['Profiles', 'Examples and test cases', 'Operational monitoring'],
  },
]

export default function LearnPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-20 dark:bg-slate-950 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Learning center
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white">
              Practical education for people building interoperability.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Learn the concepts, standards, and implementation decisions behind reliable FHIR, HL7, terminology, consent, and API workflows.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {learningPaths.map((path) => (
                <article key={path.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {path.level}
                  </span>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">{path.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{path.detail}</p>
                  <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {path.lessons.map((lesson) => (
                      <div key={lesson} className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{lesson}</div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-lg border border-teal-200 bg-white p-6 dark:border-teal-900 dark:bg-slate-950 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Suggested first path</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Start with FHIR essentials, then connect it to a real workflow.</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Learning sticks when it is attached to implementation. Pair the FHIR basics path with the FHIR API implementation workflow.
                  </p>
                </div>
                <Link href="/workflows" className="w-fit rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25">
                  Open workflows
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
