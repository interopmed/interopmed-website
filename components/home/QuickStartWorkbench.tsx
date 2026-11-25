'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STUDIO_URL } from '@/lib/studio-constants'

const HL7_SAMPLE = `MSH|^~\\&|VITAL_MONITOR|ICU_BED_04|INTEROPMED|CENTRAL_EHR|20261124163000||ORU^R01|MSG20261124001|P|2.5
PID|1||PAT94021^^^MRN||DOE^JANE||19840912|F
OBR|1||ORD8812|8867-4^Heart rate^LN|||20261124162955
OBX|1|NM|8867-4^Heart rate^LN||78|/min|60-100|N|||F`

const FHIR_SAMPLE = `{
  "resourceType": "Observation",
  "id": "obs-heart-rate-78",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8867-4",
        "display": "Heart rate"
      }
    ]
  },
  "subject": { "reference": "Patient/PAT94021" },
  "effectiveDateTime": "2026-11-24T16:29:55Z",
  "valueQuantity": {
    "value": 78,
    "unit": "/min",
    "system": "http://unitsofmeasure.org",
    "code": "/min"
  }
}`

const SHIN_FLOW_SAMPLE = `// SHIN Connected EHR + LIS Clinical Test Flow
1. CPOE ORDER:
   Doctor orders panel (LOINC 8867-4) in SHIN EHR chart
2. HL7 DISPATCH:
   Outbound ORM^O01 message routes order to SHIN Laboratory Module
3. SPECIMEN TRACKING:
   Sample tube barcoded (BC-8812), accessioned & routed to analyzer
4. RESULT VERIFICATION:
   Bi-directional analyzer verification creates HL7 ORU^R01 payload
5. CLINICAL DELIVERY:
   FHIR DiagnosticReport updates attending physician chart in real time`

export default function QuickStartWorkbench() {
  const [activeTab, setActiveTab] = useState<'hl7' | 'fhir' | 'shin'>('hl7')
  const [copied, setCopied] = useState(false)

  const activeContent =
    activeTab === 'hl7' ? HL7_SAMPLE : activeTab === 'fhir' ? FHIR_SAMPLE : SHIN_FLOW_SAMPLE

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 py-7 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900/50 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center xl:gap-8">
          {/* LEFT COLUMN: Direct Value & Actions */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/70 px-3 py-1 text-[11px] font-semibold text-teal-800 dark:border-teal-900/70 dark:bg-teal-950/60 dark:text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
              </span>
              Clinical Interoperability &amp; Simulation Platform
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-[2rem] lg:leading-tight">
              Connect Hospital Data to FHIR in Days, Not Months.
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
              The complete developer &amp; informatics suite. Visually map legacy HL7 v2 and JSON into FHIR R4, generate production Python/TypeScript pipelines, and simulate live clinical flows inside our <strong className="font-semibold text-teal-700 dark:text-teal-300">SHIN EHR &amp; LIS testbed</strong>.
            </p>

            {/* 4 DIRECT ACTION TILES */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {/* Tile 1: Studio Mapper */}
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-indigo-200/90 bg-indigo-50/40 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-indigo-400 hover:bg-indigo-50/70 dark:border-indigo-900/70 dark:bg-indigo-950/30 dark:hover:border-indigo-400"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    1. Studio Mapper
                  </span>
                  <span className="rounded bg-indigo-200/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
                    Studio ↗
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-indigo-800 dark:text-indigo-300">
                  Map HL7 &amp; JSON to FHIR R4 &amp; export pipelines →
                </span>
              </a>

              {/* Tile 2: SHIN Testbed */}
              <a
                href="https://shin.interopmed.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-teal-300/80 bg-teal-50/40 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:bg-teal-50/70 dark:border-teal-900/70 dark:bg-teal-950/30 dark:hover:border-teal-400"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                    2. SHIN EHR &amp; LIS Testbed
                  </span>
                  <span className="rounded bg-teal-200/80 px-1.5 py-0.5 text-[10px] font-bold text-teal-900 dark:bg-teal-900 dark:text-teal-200">
                    shin.interopmed.com ↗
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-teal-800 dark:text-teal-300">
                  Simulate live orders, lab accessioning &amp; analyzer feeds →
                </span>
              </a>

              {/* Tile 3: FHIR & HL7 Tools */}
              <Link
                href="/tools"
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                    3. FHIR API &amp; HL7 Tools
                  </span>
                  <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600">→</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Inspect raw segments &amp; query interactive FHIR APIs
                </span>
              </Link>

              {/* Tile 4: InteropMind AI */}
              <Link
                href="/interopmind"
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                    4. InteropMind AI Copilot
                  </span>
                  <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600">→</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  LOINC/SNOMED lookup &amp; clinical mapping guidance
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Mini-Preview Card */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/10">
              {/* Tab Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('hl7')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${activeTab === 'hl7'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    HL7 v2 (ORU^R01)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fhir')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${activeTab === 'fhir'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    FHIR R4 (Observation)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('shin')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${activeTab === 'shin'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    SHIN EHR Flow
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                >
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <pre className="h-44 overflow-y-auto p-4 text-[12px] leading-relaxed font-mono text-slate-300">
                  {activeTab === 'hl7' ? (
                    <code>
                      <span className="text-sky-400">MSH</span>|^~\&amp;|<span className="text-emerald-400">VITAL_MONITOR</span>|ICU_BED_04|INTEROPMED|CENTRAL_EHR|20261124163000||<span className="text-amber-300">ORU^R01</span>|MSG20261124001|P|2.5{'\n'}
                      <span className="text-sky-400">PID</span>|1||<span className="text-teal-300">PAT94021^^^MRN</span>||DOE^JANE||19840912|F{'\n'}
                      <span className="text-sky-400">OBR</span>|1||ORD8812|<span className="text-amber-300">8867-4^Heart rate^LN</span>|||20261124162955{'\n'}
                      <span className="text-sky-400">OBX</span>|1|NM|<span className="text-amber-300">8867-4^Heart rate^LN</span>||<span className="text-fuchsia-400 font-bold">78</span>|<span className="text-teal-300">/min</span>|60-100|N|||F
                    </code>
                  ) : activeTab === 'fhir' ? (
                    <code>
                      {`{\n`}
                      {`  "resourceType": "Observation",\n`}
                      {`  "id": "obs-heart-rate-78",\n`}
                      {`  "status": "final",\n`}
                      {`  "code": {\n`}
                      {`    "coding": [{\n`}
                      {`      "system": "http://loinc.org",\n`}
                      {`      "code": "8867-4",\n`}
                      {`      "display": "Heart rate"\n`}
                      {`    }]\n`}
                      {`  },\n`}
                      {`  "subject": { "reference": "Patient/PAT94021" },\n`}
                      {`  "valueQuantity": {\n`}
                      {`    "value": 78,\n`}
                      {`    "unit": "/min",\n`}
                      {`    "system": "http://unitsofmeasure.org",\n`}
                      {`    "code": "/min"\n`}
                      {`  }\n`}
                      {`}`}
                    </code>
                  ) : (
                    <code>
                      <span className="text-emerald-400">// SHIN Connected EHR + LIS Clinical Test Flow</span>{'\n'}
                      <span className="text-sky-400">1. CPOE ORDER:</span> Doctor orders panel (<span className="text-amber-300">LOINC 8867-4</span>) in SHIN EHR{'\n'}
                      <span className="text-sky-400">2. HL7 DISPATCH:</span> Outbound <span className="text-teal-300">ORM^O01</span> message routes to SHIN LIS Module{'\n'}
                      <span className="text-sky-400">3. SPECIMEN:</span> Sample barcoded (<span className="text-fuchsia-400">BC-8812</span>), accessioned &amp; routed{'\n'}
                      <span className="text-sky-400">4. RESULT:</span> Analyzer verifies &amp; emits <span className="text-teal-300">HL7 ORU^R01</span> / <span className="text-emerald-300">FHIR</span>{'\n'}
                      <span className="text-sky-400">5. CHART:</span> Real-time notification delivered into clinician chart
                    </code>
                  )}
                </pre>
              </div>

              {/* Card Footer with Sandbox & Studio Links */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <a
                    href={STUDIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-semibold text-indigo-400 transition hover:text-indigo-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                    Map in Studio ↗
                  </a>
                  <span className="text-slate-700">|</span>
                  <a
                    href="https://shin.interopmed.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-semibold text-teal-400 transition hover:text-teal-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Simulate in SHIN ↗
                  </a>
                </div>
                <Link
                  href="/tools"
                  className="text-slate-400 transition hover:text-slate-200"
                >
                  Full Toolkit →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
