import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'SHIN EHR & LIS Clinical Testbed | InteropMed Interoperability Hub',
  description: 'Hands-on clinical interoperability test tool: simulate and research order-to-result data flows connecting Electronic Health Records (EHR) and Laboratory Information Systems (LIS) via HL7 and FHIR.',
}

const ehrWorkflows = [
  {
    step: '01. Patient Registration & MPI',
    title: 'Demographics & Master Patient Index',
    detail: 'Unique national / hospital health identifiers, demographic deduplication, visit classification, and emergency triage assignment.',
    standards: ['FHIR Patient', 'HL7 ADT^A04', 'Identifier System'],
  },
  {
    step: '02. Clinical Documentation',
    title: 'Encounter Charting & Problem Lists',
    detail: 'Structured clinical findings, vital signs recording, past medical history, active allergies, and longitudinal progress notes.',
    standards: ['SNOMED CT', 'FHIR Condition', 'FHIR Encounter'],
  },
  {
    step: '03. CPOE & Order Communication',
    title: 'Computerized Physician Order Entry',
    detail: 'Direct clinical ordering for diagnostic tests, imaging studies, and pharmacy items with embedded formulary and safety checks.',
    standards: ['FHIR ServiceRequest', 'HL7 ORM^O01', 'LOINC'],
  },
  {
    step: '04. Clinical Decision Support',
    title: 'Context-Aware Safety Interventions',
    detail: 'Non-disruptive drug-drug interaction warnings, abnormal lab value alerts, and clinical practice guideline recommendations.',
    standards: ['CDS Hooks', 'FHIR GuidanceResponse', 'RxNorm'],
  },
]

const lisWorkflows = [
  {
    step: '01. Order Ingestion & Accessioning',
    title: 'Specimen Barcoding & Tracking',
    detail: 'Automated receipt of EHR laboratory orders, sample barcoding, accession number generation, and tube routing.',
    standards: ['HL7 ORM Inbound', 'Specimen Tube ID', 'FHIR Specimen'],
  },
  {
    step: '02. Laboratory Analyzer Integration',
    title: 'Bi-directional Modality Communication',
    detail: 'Direct interfacing with hematology, biochemistry, and immunoassay analyzers via ASTM 1381/1394 and HL7 v2 protocols.',
    standards: ['ASTM Interface', 'HL7 v2.5.1', 'Device Telemetry'],
  },
  {
    step: '03. Result Verification & Delta Checks',
    title: 'Quality Control & Critical Flags',
    detail: 'Automated delta-checking against patient historical baselines, critical panicking value alerts, and pathologist approval.',
    standards: ['LOINC Observation', 'Reference Intervals', 'Abnormal Flags'],
  },
  {
    step: '04. EHR Result Notification',
    title: 'Instant Electronic Delivery',
    detail: 'Real-time transmission of finalized laboratory reports directly into the clinician EMR chart and bedside mobile app.',
    standards: ['HL7 ORU^R01', 'FHIR DiagnosticReport', 'Observation'],
  },
]

export default function EhrLisExplorationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  Clinical Test Tool &amp; Sandbox
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  shin.interopmed.com Online
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                SHIN EHR &amp; LIS Clinical Interoperability Testbed
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                A connected Electronic Health Record and Laboratory Information System test tool for clinical informaticians, researchers, doctors, and engineers to simulate, validate, and research clinical order-to-result data flows using international standards (HL7, FHIR, LOINC, and SNOMED CT).
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="https://shin.interopmed.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                >
                  <span>Launch Live SHIN EHR (shin.interopmed.com)</span>
                  <span className="text-xs">↗</span>
                </a>
                <Link
                  href="/tools"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Test FHIR &amp; HL7 in Tools →
                </Link>
                <Link
                  href="/interopmind"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400"
                >
                  Ask InteropMind AI →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* EHR SECTION */}
        <section className="py-16 md:py-20 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Clinical Workflow</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Electronic Health Record (EHR) Architecture
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                How clinicians interact with patient records, order sets, and clinical decision support systems.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ehrWorkflows.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{item.step}</span>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Underlying Standards</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.standards.map((std) => (
                        <span key={std} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIS SECTION */}
        <section className="py-16 md:py-20 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Diagnostic Pipeline</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Laboratory Information System (LIS) Workflows
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                From electronic physician order receipt to analyzer specimen processing, delta verification, and result reporting.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {lisWorkflows.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-7 shadow-sm transition hover:border-teal-300 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{item.step}</span>
                    <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                  <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protocol & Formats</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.standards.map((std) => (
                        <span key={std} className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EHR-LIS INTEROPERABILITY BRIDGE */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-8 dark:border-teal-900/60 dark:bg-teal-950/20 md:p-12">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                  Semantic Interoperability Bridge
                </span>
                <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                  Connecting Clinical Orders with Laboratory Diagnostics
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
                  When a doctor orders a Complete Blood Count (CBC) or Serum Creatinine in the EHR, the request is translated via FHIR ServiceRequest or HL7 ORM^O01 with universal LOINC codes. Once the LIS completes the run, results flow back as FHIR DiagnosticReport / HL7 ORU^R01, automatically updating the clinician chart.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/tools"
                    className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
                  >
                    Simulate EHR-LIS Exchange in Tools
                  </Link>
                  <Link
                    href="/interopmind"
                    className="rounded-xl border border-teal-300 px-6 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-100 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-950"
                  >
                    Ask Questions in InteropMind
                  </Link>
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
