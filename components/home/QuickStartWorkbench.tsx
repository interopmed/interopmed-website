'use client'

import { useState } from 'react'
import Link from 'next/link'

const HL7_SAMPLE = `MSH|^~\\&|VITAL_MONITOR|ICU_BED_04|INTEROPMED|CENTRAL_EHR|20261123163000||ORU^R01|MSG20261123001|P|2.5
PID|1||PAT94021^^^MRN||DOE^JANE||19840912|F
OBR|1||ORD8812|8867-4^Heart rate^LN|||20261123162955
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
  "effectiveDateTime": "2026-11-23T16:29:55Z",
  "valueQuantity": {
    "value": 78,
    "unit": "/min",
    "system": "http://unitsofmeasure.org",
    "code": "/min"
  }
}`

export default function QuickStartWorkbench() {
  const [activeTab, setActiveTab] = useState<'hl7' | 'fhir'>('hl7')
  const [copied, setCopied] = useState(false)

  const activeContent = activeTab === 'hl7' ? HL7_SAMPLE : FHIR_SAMPLE

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
              Quick-Start Interoperability Workbench
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-[2rem] lg:leading-tight">
              Build, Test &amp; Master Healthcare Interoperability.
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
              Inspect live HL7 v2 &amp; FHIR R4 payloads, trace end-to-end EHR/LIS clinical workflows, and explore open standards guides.
            </p>

            {/* 4 DIRECT ACTION TILES */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Link
                href="/tools"
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                    Open FHIR &amp; HL7 Parser
                  </span>
                  <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600">→</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Parse segments &amp; test live FHIR R4 APIs
                </span>
              </Link>

              <Link
                href="/ehr-lis"
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                    Explore EHR + LIS Flow
                  </span>
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    shin.interopmed.com
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Trace CPOE orders &amp; lab results
                </span>
              </Link>

              <Link
                href="/articles"
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-950 transition group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                    Read Interoperability Guides
                  </span>
                  <span className="text-xs text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600">→</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  HL7, FHIR, SNOMED &amp; practical playbooks
                </span>
              </Link>

              <Link
                href="/interopmind"
                className="group flex flex-col justify-between rounded-xl border border-teal-200/80 bg-teal-50/40 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition hover:border-teal-500 hover:bg-teal-50/70 dark:border-teal-900/60 dark:bg-teal-950/30 dark:hover:border-teal-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 transition dark:text-teal-200">
                    Ask InteropMind
                  </span>
                  <span className="text-xs text-teal-600 transition group-hover:translate-x-0.5">→</span>
                </div>
                <span className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Interactive health informatics AI workspace
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Mini-Preview Card */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/10">
              {/* Tab Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('hl7')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === 'hl7'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HL7 v2 Input (ORU^R01)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fhir')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === 'fhir'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    FHIR R4 Output (Observation)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded px-2.5 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                >
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <pre className="h-44 overflow-y-auto p-4 text-[12px] leading-relaxed font-mono text-slate-300">
                  {activeTab === 'hl7' ? (
                    <code>
                      <span className="text-sky-400">MSH</span>|^~\&amp;|<span className="text-emerald-400">VITAL_MONITOR</span>|ICU_BED_04|INTEROPMED|CENTRAL_EHR|20261123163000||<span className="text-amber-300">ORU^R01</span>|MSG20261123001|P|2.5{'\n'}
                      <span className="text-sky-400">PID</span>|1||<span className="text-teal-300">PAT94021^^^MRN</span>||DOE^JANE||19840912|F{'\n'}
                      <span className="text-sky-400">OBR</span>|1||ORD8812|<span className="text-amber-300">8867-4^Heart rate^LN</span>|||20261123162955{'\n'}
                      <span className="text-sky-400">OBX</span>|1|NM|<span className="text-amber-300">8867-4^Heart rate^LN</span>||<span className="text-fuchsia-400 font-bold">78</span>|<span className="text-teal-300">/min</span>|60-100|N|||F
                    </code>
                  ) : (
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
                  )}
                </pre>
              </div>

              {/* Card Footer with Sandbox Link */}
              <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Observation LOINC 8867-4 ↔ 78 /min
                </span>
                <Link
                  href="/tools"
                  className="font-semibold text-teal-400 transition hover:text-teal-300"
                >
                  Try your own payload in Tools →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
