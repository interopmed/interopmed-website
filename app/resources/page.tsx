import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Healthcare Standards & Resources | InteropMed',
  description: 'Curated technical specifications, terminology systems, implementation guides, and open healthcare technology references.',
}

const resources = [
  {
    category: 'International Standards',
    items: [
      {
        title: 'HL7 FHIR Release 4 & 5 Specifications',
        description: 'Official resource definitions, RESTful API specifications, search parameters, and JSON schemas.',
        link: 'https://hl7.org/fhir/',
        external: true,
      },
      {
        title: 'HL7 v2.x Standard Specifications',
        description: 'Comprehensive messaging guidelines for patient administration, laboratory orders, and clinical results.',
        link: 'https://www.hl7.org/',
        external: true,
      },
      {
        title: 'DICOM Standard for Medical Imaging',
        description: 'The international standard to communicate and manage medical images and related data.',
        link: 'https://www.dicomstandard.org/',
        external: true,
      },
    ],
  },
  {
    category: 'Clinical Terminology & Code Systems',
    items: [
      {
        title: 'SNOMED CT International Edition',
        description: 'The global standard for clinical terminology, clinical findings, anatomy, and procedures.',
        link: 'https://www.snomed.org/',
        external: true,
      },
      {
        title: 'LOINC (Regenstrief Institute)',
        description: 'Standard codes for laboratory tests, clinical observations, vital signs, and survey instruments.',
        link: 'https://loinc.org/',
        external: true,
      },
      {
        title: 'WHO ICD-10 & ICD-11 Classifications',
        description: 'World Health Organization diagnostic classifications for morbidity and mortality statistics.',
        link: 'https://icd.who.int/',
        external: true,
      },
    ],
  },
  {
    category: 'InteropMed Knowledge References',
    items: [
      {
        title: 'Standards & Mapping Reference',
        description: 'Field-level guidance for moving legacy HL7 v2 and clinical data into FHIR resources.',
        link: '/knowledge',
        external: false,
      },
      {
        title: 'Interoperability Learning Paths',
        description: 'Structured educational modules from beginner foundations to advanced security and consent.',
        link: '/learn',
        external: false,
      },
      {
        title: 'InteropMind Knowledge Explorer',
        description: 'Interactive environment for evaluating clinical workflows and asking technical standards questions.',
        link: '/interopmind',
        external: false,
      },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Standards & References
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Healthcare Standards & Resources
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                A curated index of international healthcare standards, terminology services, technical implementation guides, and open informatics resources for engineers and health professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Resources Groups */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 space-y-16">
            {resources.map((group) => (
              <div key={group.category}>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
                  {group.category}
                </h2>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <h3 className="text-base font-bold text-slate-950 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {item.external ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                          >
                            Visit Official Site
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            href={item.link}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                          >
                            Explore Resource →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
