import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Healthcare Interoperability | InteropMed',
  description: 'Standards, protocols, and technical architecture for seamless healthcare data exchange: HL7 FHIR, SNOMED CT, LOINC, DICOM, and REST APIs.',
}

const standards = [
  {
    code: 'HL7 FHIR',
    name: 'Fast Healthcare Interoperability Resources',
    description: 'The contemporary global standard for clinical data exchange. Utilizes modern web paradigms (JSON, REST, OAuth2) across modular clinical resources.',
    coverage: ['Patient', 'Observation', 'Encounter', 'Condition', 'MedicationRequest'],
    link: '/articles/why-fhir-native-middleware-matters',
  },
  {
    code: 'HL7 v2.x',
    name: 'Legacy Message Exchange Protocol',
    description: 'The ubiquitous workhorse of hospital interface engines. Pipe-and-hat delimited messaging powering ADT (admissions), ORM (orders), and ORU (results).',
    coverage: ['ADT (Movement)', 'ORM (Orders)', 'ORU (Results)', 'SIU (Scheduling)'],
    link: '/knowledge',
  },
  {
    code: 'SNOMED CT',
    name: 'Clinical Terminology System',
    description: 'The comprehensive global clinical healthcare terminology offering scientifically validated, polyhierarchical concepts for clinical documentation.',
    coverage: ['Clinical Findings', 'Procedures', 'Anatomy', 'Substances'],
    link: '/articles/terminology-strategy-snomed-loinc-icd',
  },
  {
    code: 'LOINC',
    name: 'Logical Observation Identifiers Names and Codes',
    description: 'The universal code system for identifying medical laboratory observations, vital signs, diagnostic study results, and clinical assessment tools.',
    coverage: ['Lab Analyzers', 'Specimens', 'Vital Signs', 'Units of Measure'],
    link: '/articles/terminology-strategy-snomed-loinc-icd',
  },
  {
    code: 'ICD-10 / ICD-11',
    name: 'International Classification of Diseases',
    description: 'Standard diagnostic classification maintained by the World Health Organization for epidemiological tracking, mortality statistics, and health policy.',
    coverage: ['Disease Coding', 'Morbidity', 'Mortality', 'Casemix'],
    link: '/resources',
  },
  {
    code: 'DICOM',
    name: 'Digital Imaging and Communications in Medicine',
    description: 'The foundational standard for medical imaging transmission, storage, and modality communication, modernized via web-based DICOMweb (WADO/QIDO/STOW).',
    coverage: ['Modality Acquisition', 'PACS / VNA', 'DICOMweb', 'ImagingStudy'],
    link: '/articles/medical-imaging-dicom-fhir-integration',
  },
]

export default function InteroperabilityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Pillar 02
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Making Healthcare Systems Work Together
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Healthcare interoperability enables secure, standardized data exchange across heterogeneous systems, clinical laboratories, pharmacies, diagnostic modalities, and patient portals without losing clinical context.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/articles/why-fhir-native-middleware-matters"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                >
                  Explore FHIR Middleware
                </Link>
                <Link
                  href="/resources"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                >
                  View Standards Index
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Standards Directory */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Core Interoperability Standards
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
                A structured breakdown of transport protocols, semantic terminologies, and medical device standards.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {standards.map((std) => (
                <div
                  key={std.code}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">
                        {std.code}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                      {std.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {std.description}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Concepts</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {std.coverage.map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={std.link}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                    >
                      Read technical guide →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Semantic vs Syntactic Diagram */}
        <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                Levels of Health Data Interoperability
              </h2>
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">1. Foundational / Transport</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Moves raw bits and bytes between endpoints safely using standard protocols (HTTPS, TLS, TCP/IP, MLLP).
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">2. Structural / Syntactic</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Standardizes the data format and message schema (JSON, XML, FHIR Resources, HL7 Segments) so receiving systems can parse each field.
                  </p>
                </div>
                <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                  <p className="font-bold text-teal-800 dark:text-teal-300">3. Semantic Interoperability</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Preserves the exact clinical meaning across systems using standardized reference terminologies (SNOMED CT, LOINC, RxNorm) so medical logic executes reliably.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
