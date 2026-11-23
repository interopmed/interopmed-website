'use client'

import { useState } from 'react'

export default function APIPlayground() {
  const [selectedResource, setSelectedResource] = useState('patient')
  const [response, setResponse] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const mockData: Record<string, Record<string, unknown>> = {
    patient: {
      resourceType: "Patient",
      id: "pat-001",
      identifier: [
        {
          system: "https://interopmed.com/patients",
          value: "PAT-98421"
        }
      ],
      name: [
        {
          use: "official",
          family: "Perera",
          given: ["Kasun", "Anuradha"]
        }
      ],
      gender: "male",
      birthDate: "1982-04-12",
      address: [
        {
          city: "Colombo",
          country: "Sri Lanka"
        }
      ]
    },
    observation: {
      resourceType: "Observation",
      id: "obs-vitals-01",
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "85354-9",
            display: "Blood pressure panel with all children optional"
          }
        ],
        text: "Blood Pressure"
      },
      subject: {
        reference: "Patient/pat-001"
      },
      effectiveDateTime: "2026-06-14T14:30:00Z",
      component: [
        {
          code: {
            coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }]
          },
          valueQuantity: { value: 120, unit: "mmHg", code: "mm[Hg]" }
        },
        {
          code: {
            coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }]
          },
          valueQuantity: { value: 80, unit: "mmHg", code: "mm[Hg]" }
        }
      ]
    },
    encounter: {
      resourceType: "Encounter",
      id: "enc-outpatient-101",
      status: "finished",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB",
        display: "Ambulatory outpatient visit"
      },
      subject: {
        reference: "Patient/pat-001"
      },
      period: {
        start: "2026-06-14T10:00:00Z",
        end: "2026-06-14T10:45:00Z"
      },
      reasonCode: [
        {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "73211009",
              display: "Diabetes mellitus"
            }
          ]
        }
      ]
    },
    diagnosticReport: {
      resourceType: "DiagnosticReport",
      id: "lis-rep-8842",
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: "LAB",
              display: "Laboratory LIS Report"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "24357-6",
            display: "Urinalysis macro (dipstick) panel"
          }
        ],
        text: "Urinalysis Diagnostic Panel"
      },
      subject: {
        reference: "Patient/pat-001"
      },
      effectiveDateTime: "2026-06-14T09:15:00Z",
      conclusion: "Routine laboratory urinalysis within expected physiological limits."
    },
    serviceRequest: {
      resourceType: "ServiceRequest",
      id: "ehr-cpoe-order-401",
      status: "active",
      intent: "order",
      category: [
        {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "108252007",
              display: "Laboratory procedure"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "1751-7",
            display: "Albumin [Mass/volume] in Serum or Plasma"
          }
        ],
        text: "EHR CPOE Serum Albumin Order"
      },
      subject: {
        reference: "Patient/pat-001"
      },
      authoredOn: "2026-06-14T08:45:00Z"
    }
  }

  const handleFetch = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 80))
    setResponse(mockData[selectedResource] ?? null)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            Interactive Interoperability Tool
          </span>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            FHIR & Clinical Standards Explorer
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Simulate RESTful retrieval of clinical EHR orders and LIS laboratory reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Select Healthcare Resource
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'patient', label: 'Patient (Demographics)' },
                { id: 'observation', label: 'Observation (Vitals)' },
                { id: 'encounter', label: 'Encounter (Visit)' },
                { id: 'diagnosticReport', label: 'DiagnosticReport (LIS)' },
                { id: 'serviceRequest', label: 'ServiceRequest (CPOE)' },
              ].map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => {
                    setSelectedResource(resource.id)
                    setResponse(null)
                  }}
                  className={`px-3 py-2.5 rounded-xl font-medium text-xs text-left transition-all ${
                    selectedResource === resource.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {resource.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-teal-600 dark:text-teal-400 font-bold">GET</span>
            <span className="truncate">/api/fhir/r4/{selectedResource}/sample-id</span>
            <span className="text-[10px] text-slate-400">application/fhir+json</span>
          </div>

          <button
            type="button"
            onClick={handleFetch}
            disabled={loading}
            className="w-full px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-sm transition hover:bg-teal-600 dark:hover:bg-teal-400 disabled:opacity-50"
          >
            {loading ? 'Retrieving Resource...' : `Fetch ${selectedResource} Payload`}
          </button>
        </div>

        {/* Response Preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs overflow-auto max-h-[380px]">
          <div className="flex items-center justify-between text-teal-400 mb-3 border-b border-slate-800 pb-2">
            <span className="font-bold">HTTP 200 OK</span>
            <span className="text-slate-500">Content-Type: application/fhir+json</span>
          </div>
          {response ? (
            <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <p className="text-slate-500 italic py-12 text-center">
              Click &quot;Fetch {selectedResource} Payload&quot; to inspect structured clinical data.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
