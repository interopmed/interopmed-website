import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import APIPlayground from '@/components/sections/APIPlayground'
import HL7Inspector from '@/components/tools/HL7Inspector'

export const metadata = {
  title: 'Interoperability Tools | InteropMed',
  description: 'Hands-on utilities for health informaticians: interactive FHIR API playground, HL7 message parser, and EHR/LIS workflow explorers.',
}

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900 md:py-18">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Practical Utilities
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Interoperability Tools & Clinical Sandboxes
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                Practical tools for health informaticians and digital health engineers. Inspect clinical FHIR resources, parse HL7 v2 payloads, explore EHR and LIS workflows, and validate data contracts.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/ehr-lis"
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700"
                >
                  Explore Our EHR & LIS System →
                </Link>
                <Link
                  href="/interopmind"
                  className="rounded-xl border border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                >
                  Ask InteropMind AI
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* TOOL 1: FHIR API PLAYGROUND */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Tool 01</span>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                FHIR Resource & REST API Playground
              </h2>
            </div>
            <APIPlayground />
          </div>
        </section>

        {/* TOOL 2: HL7 V2 MESSAGE INSPECTOR */}
        <section className="border-t border-slate-200 py-12 dark:border-slate-800 md:py-16 bg-white dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Tool 02</span>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                HL7 v2 Message Parser & Segment Inspector
              </h2>
            </div>
            <HL7Inspector />
          </div>
        </section>

        {/* EHR & LIS CALLOUT */}
        <section className="border-t border-slate-200 py-16 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                    Clinical Architecture
                  </span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
                    Explore Our Connected EHR & LIS System
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Discover how clinical encounters, problem lists, computerized order entry (CPOE), and laboratory specimen processing communicate through standardized HL7 and FHIR pipelines.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/ehr-lis"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400"
                  >
                    View EHR & LIS System →
                  </Link>
                  <Link
                    href="/interopmind"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
                  >
                    Interactive Guidance
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
