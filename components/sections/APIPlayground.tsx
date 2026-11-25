'use client'

import { useState } from 'react'
import { STUDIO_URL } from '@/lib/studio-constants'

type PresetServer = {
  id: string
  name: string
  baseUrl: string
  description: string
  authRequired: boolean
}

const PRESET_SERVERS: PresetServer[] = [
  {
    id: 'smart',
    name: 'SMART Health IT R4 Sandbox',
    baseUrl: 'https://r4.smarthealthit.org',
    description: 'Open public FHIR sandbox with rich synthetic clinical charts (Patients, Labs, Vitals).',
    authRequired: false,
  },
  {
    id: 'hapi',
    name: 'HAPI FHIR Public R4 Server',
    baseUrl: 'https://hapi.fhir.org/baseR4',
    description: 'Official HL7 open reference implementation server for standards compliance testing.',
    authRequired: false,
  },
  {
    id: 'custom',
    name: 'Custom Hospital EHR / Test Server',
    baseUrl: '',
    description: 'Connect directly to your hospital staging EHR, sandbox, or local FHIR container.',
    authRequired: true,
  },
]

type ResourceOption = {
  id: string
  label: string
  path: string
  category: string
}

const QUERY_OPTIONS: ResourceOption[] = [
  { id: 'metadata', label: 'CapabilityStatement (/metadata)', path: '/metadata', category: 'Conformance' },
  { id: 'patient', label: 'Patient (Demographics)', path: '/Patient?_count=3', category: 'Clinical Records' },
  { id: 'observation', label: 'Observation (Vitals & Labs)', path: '/Observation?_count=3', category: 'Clinical Records' },
  { id: 'condition', label: 'Condition (Problem List)', path: '/Condition?_count=3', category: 'Clinical Records' },
  { id: 'diagnosticReport', label: 'DiagnosticReport (LIS Results)', path: '/DiagnosticReport?_count=3', category: 'Diagnostics' },
  { id: 'serviceRequest', label: 'ServiceRequest (CPOE Orders)', path: '/ServiceRequest?_count=3', category: 'Orders' },
  { id: 'encounter', label: 'Encounter (Hospital Visits)', path: '/Encounter?_count=3', category: 'Visits' },
]

type SendTemplate = {
  id: string
  label: string
  method: 'POST' | 'PUT'
  path: string
  description: string
  payload: Record<string, unknown>
}

const SEND_TEMPLATES: SendTemplate[] = [
  {
    id: 'post-patient',
    label: 'Create Patient (POST /Patient)',
    method: 'POST',
    path: '/Patient',
    description: 'Register a new patient with MRN, name, birth date, gender, and contact info.',
    payload: {
      resourceType: 'Patient',
      identifier: [
        {
          system: 'https://hospital.interopmed.com/mrn',
          value: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: 'Silva',
          given: ['Nuwan', 'Chathuranga'],
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: '+94 77 123 4567',
          use: 'mobile',
        },
      ],
      gender: 'male',
      birthDate: '1988-06-21',
      address: [
        {
          use: 'home',
          line: ['42 Hospital Road'],
          city: 'Colombo',
          country: 'LK',
        },
      ],
    },
  },
  {
    id: 'post-vital',
    label: 'Submit Vital Sign (POST /Observation)',
    method: 'POST',
    path: '/Observation',
    description: 'Post a clinical heart rate observation with universal LOINC coding.',
    payload: {
      resourceType: 'Observation',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate',
          },
        ],
        text: 'Heart rate',
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: 76,
        unit: 'beats/minute',
        system: 'http://unitsofmeasure.org',
        code: '/min',
      },
    },
  },
  {
    id: 'post-lab',
    label: 'Submit Lab Result (POST /Observation)',
    method: 'POST',
    path: '/Observation',
    description: 'Post a serum chemistry lab observation with reference intervals and high flag.',
    payload: {
      resourceType: 'Observation',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '2823-3',
            display: 'Potassium [Moles/volume] in Serum or Plasma',
          },
        ],
        text: 'Serum Potassium',
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: 5.4,
        unit: 'mmol/L',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L',
      },
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'H',
              display: 'High',
            },
          ],
        },
      ],
      referenceRange: [
        {
          low: { value: 3.5, unit: 'mmol/L' },
          high: { value: 5.1, unit: 'mmol/L' },
        },
      ],
    },
  },
  {
    id: 'post-order',
    label: 'CPOE Lab Order (POST /ServiceRequest)',
    method: 'POST',
    path: '/ServiceRequest',
    description: 'Physician diagnostic order entry for Complete Urinalysis test panel.',
    payload: {
      resourceType: 'ServiceRequest',
      status: 'active',
      intent: 'order',
      priority: 'urgent',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '24357-6',
            display: 'Urinalysis macro (dipstick) panel',
          },
        ],
        text: 'Urinalysis Diagnostic Panel',
      },
      authoredOn: new Date().toISOString(),
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '68566005',
              display: 'Urinary tract infectious disease',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'validate-resource',
    label: 'Validate Conformance ($validate)',
    method: 'POST',
    path: '/Observation/$validate',
    description: 'Check payload compliance against FHIR schemas without saving to EHR database.',
    payload: {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart rate',
          },
        ],
      },
      valueQuantity: {
        value: 82,
        unit: '/min',
        system: 'http://unitsofmeasure.org',
        code: '/min',
      },
    },
  },
]

export default function APIPlayground() {
  const [mode, setMode] = useState<'query' | 'send'>('query')
  const [selectedServerId, setSelectedServerId] = useState<string>('smart')
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('https://hapi.fhir.org/baseR4')
  const [bearerToken, setBearerToken] = useState<string>('')

  // Query Mode state
  const [selectedQueryId, setSelectedQueryId] = useState<string>('patient')
  const [queryPath, setQueryPath] = useState<string>('/Patient?_count=3')
  const [isCustomQueryPath, setIsCustomQueryPath] = useState(false)

  // Send Mode state
  const [selectedSendTemplateId, setSelectedSendTemplateId] = useState<string>('post-patient')
  const [sendMethod, setSendMethod] = useState<'POST' | 'PUT'>('POST')
  const [sendPath, setSendPath] = useState<string>('/Patient')
  const [sendPayloadText, setSendPayloadText] = useState<string>(
    JSON.stringify(SEND_TEMPLATES[0].payload, null, 2)
  )
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null)

  // Request & Response state
  const [loading, setLoading] = useState(false)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [statusText, setStatusText] = useState<string>('')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({})
  const [responseData, setResponseData] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeServer = PRESET_SERVERS.find((s) => s.id === selectedServerId) || PRESET_SERVERS[0]
  const currentBaseUrl = selectedServerId === 'custom' ? customBaseUrl : activeServer.baseUrl

  const activePath =
    mode === 'query'
      ? isCustomQueryPath
        ? queryPath.startsWith('/')
          ? queryPath
          : `/${queryPath}`
        : QUERY_OPTIONS.find((r) => r.id === selectedQueryId)?.path || '/Patient?_count=3'
      : sendPath.startsWith('/')
      ? sendPath
      : `/${sendPath}`

  const fullTargetUrl = `${currentBaseUrl.replace(/\/$/, '')}${activePath}`

  const handleSelectSendTemplate = (tpl: SendTemplate) => {
    setSelectedSendTemplateId(tpl.id)
    setSendMethod(tpl.method)
    setSendPath(tpl.path)
    setSendPayloadText(JSON.stringify(tpl.payload, null, 2))
    setJsonValidationError(null)
  }

  const handlePayloadChange = (text: string) => {
    setSendPayloadText(text)
    try {
      JSON.parse(text)
      setJsonValidationError(null)
    } catch (err: unknown) {
      setJsonValidationError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleFormatPayload = () => {
    try {
      const parsed = JSON.parse(sendPayloadText)
      setSendPayloadText(JSON.stringify(parsed, null, 2))
      setJsonValidationError(null)
    } catch (err: unknown) {
      setJsonValidationError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleExecuteRequest = async () => {
    if (!currentBaseUrl.trim()) {
      setErrorMessage('Please enter a valid Base FHIR URL.')
      return
    }

    let parsedBody: unknown = null
    if (mode === 'send') {
      try {
        parsedBody = JSON.parse(sendPayloadText)
      } catch {
        setErrorMessage('Invalid JSON payload. Please fix syntax errors before sending.')
        return
      }
    }

    setLoading(true)
    setErrorMessage(null)
    setResponseStatus(null)
    setResponseData(null)

    try {
      const headers: Record<string, string> = {}
      if (bearerToken.trim()) {
        headers['Authorization'] = bearerToken.trim().startsWith('Bearer ')
          ? bearerToken.trim()
          : `Bearer ${bearerToken.trim()}`
      }

      const res = await fetch('/api/fhir/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fullTargetUrl,
          method: mode === 'send' ? sendMethod : 'GET',
          headers,
          body: mode === 'send' ? parsedBody : undefined,
        }),
      })

      const payload = await res.json()

      setResponseStatus(payload.status || (payload.success ? 200 : 502))
      setStatusText(payload.statusText || (payload.success ? 'OK' : 'Error'))
      setLatencyMs(payload.latencyMs ?? null)
      setResponseHeaders(payload.headers || {})

      if (payload.data !== undefined) {
        setResponseData(payload.data)
      } else if (payload.error) {
        setErrorMessage(payload.error)
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network failure')
    } finally {
      setLoading(false)
    }
  }

  const copyPayload = () => {
    if (!responseData) return
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      {/* Title Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              Live Interoperability Testbed
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Bidirectional EHR Connector</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            FHIR REST API &amp; EHR Conformance Explorer
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Query existing clinical data or send live patient records, diagnostic observations, and orders to any FHIR server.
          </p>
        </div>

        {/* Mode Selector Tabs (Query vs Send) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('query')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              mode === 'query'
                ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🔍 Query / Read (GET)
          </button>
          <button
            type="button"
            onClick={() => setMode('send')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              mode === 'send'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🚀 Send / Create (POST)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.15fr] gap-8">
        {/* Controls Column */}
        <div className="space-y-5">
          {/* 1. Target Server Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Target FHIR Server or EHR Endpoint
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_SERVERS.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedServerId(srv.id)}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    selectedServerId === srv.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-sm dark:border-teal-600 dark:bg-teal-950/30'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{srv.name}</span>
                    {srv.id === selectedServerId && (
                      <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{srv.description}</p>
                </button>
              ))}
            </div>

            {/* Custom URL Input if Custom Selected */}
            {selectedServerId === 'custom' && (
              <div className="mt-2.5 rounded-xl border border-teal-200 bg-teal-50/30 p-3 dark:border-teal-900 dark:bg-teal-950/20">
                <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-200 mb-1">
                  Custom Base URL (e.g. your hospital staging EHR or local FHIR)
                </label>
                <input
                  type="url"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://fhir-ehr.hospital.org/r4"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Optional Auth Token */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Authorization Token <span className="font-normal text-slate-400">(Optional for secured EHRs)</span>
            </label>
            <input
              type="password"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="Bearer eyJhbGciOi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* 2. MODE SPECIFIC SECTION */}
          {mode === 'query' ? (
            /* QUERY (GET) MODE */
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Select Resource Query
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomQueryPath(!isCustomQueryPath)}
                  className="text-[11px] font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  {isCustomQueryPath ? '← Pick preset' : 'Edit path manually'}
                </button>
              </div>

              {!isCustomQueryPath ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {QUERY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedQueryId(opt.id)
                        setIsCustomQueryPath(false)
                        setQueryPath(opt.path)
                      }}
                      className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                        selectedQueryId === opt.id
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="truncate">{opt.label}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={queryPath}
                  onChange={(e) => setQueryPath(e.target.value)}
                  placeholder="/Patient?name=Smith&_count=5"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              )}
            </div>
          ) : (
            /* SEND (POST / PUT) MODE */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  2. Choose Clinical Send Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SEND_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectSendTemplate(tpl)}
                      className={`rounded-lg border p-2 text-left text-xs transition ${
                        selectedSendTemplateId === tpl.id
                          ? 'border-teal-500 bg-teal-50/70 font-semibold text-teal-950 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-200'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-teal-600/10 px-1 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                          {tpl.method}
                        </span>
                        <span className="truncate">{tpl.label.split('(')[0]}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500 truncate">{tpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint path & Method switcher */}
              <div className="flex gap-2">
                <select
                  value={sendMethod}
                  onChange={(e) => setSendMethod(e.target.value as 'POST' | 'PUT')}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-teal-300"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
                <input
                  type="text"
                  value={sendPath}
                  onChange={(e) => setSendPath(e.target.value)}
                  placeholder="/Patient"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              {/* Editable Request JSON Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Request Body (application/fhir+json)
                  </span>
                  <div className="flex items-center gap-2">
                    {jsonValidationError ? (
                      <span className="text-[10px] font-semibold text-rose-500">⚠ JSON Error</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">✓ Valid JSON</span>
                    )}
                    <button
                      type="button"
                      onClick={handleFormatPayload}
                      className="text-[11px] font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      Format
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={sendPayloadText}
                  onChange={(e) => handlePayloadChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-950 p-3 font-mono text-[11px] text-slate-200 focus:border-teal-500 focus:outline-none dark:border-slate-700"
                />
              </div>
            </div>
          )}

          {/* Outbound Endpoint Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-2.5 font-mono text-xs text-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  mode === 'send'
                    ? sendMethod === 'POST'
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'bg-sky-500/20 text-sky-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {mode === 'send' ? sendMethod : 'GET'}
              </span>
              <span className="truncate text-slate-400">{fullTargetUrl}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleExecuteRequest}
            disabled={loading}
            className={`w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 ${
              mode === 'send' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Transmitting to EHR / FHIR Server...
              </span>
            ) : mode === 'send' ? (
              `Send ${sendMethod} Payload to ${activeServer.name.split(' ')[0]}`
            ) : (
              `Send GET Request to ${activeServer.name.split(' ')[0]}`
            )}
          </button>
        </div>

        {/* Live Response Panel */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-300">
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              {responseStatus !== null ? (
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : responseStatus >= 400 && responseStatus < 500
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  HTTP {responseStatus} {statusText}
                </span>
              ) : (
                <span className="text-slate-500">Status: Ready to transmit</span>
              )}

              {latencyMs !== null && (
                <span className="text-[11px] text-slate-400">
                  Latency: <strong className="text-teal-400">{latencyMs}ms</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {responseData !== null && (
                <>
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="rounded bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    {copied ? '✓ Copied' : 'Copy Response'}
                  </button>
                  <a
                    href={STUDIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-indigo-900/60 px-2 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-800 hover:text-white"
                  >
                    Send to Studio ↗
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Location Header if resource created */}
          {responseHeaders['location'] && (
            <div className="mt-2.5 rounded-lg border border-emerald-900/70 bg-emerald-950/40 p-2 text-[11px] text-emerald-300">
              <span className="font-bold">Created Resource Location:</span>{' '}
              <span className="break-all">{responseHeaders['location']}</span>
            </div>
          )}

          {/* Response Payload Body */}
          <div className="flex-1 overflow-auto max-h-[500px] py-4 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="h-8 w-8 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <p className="mt-3 text-xs">Transmitting payload to {fullTargetUrl}...</p>
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-rose-900/80 bg-rose-950/40 p-4 text-rose-300">
                <div className="font-bold">Transmission / Error Notice:</div>
                <p className="mt-1 text-xs leading-relaxed">{errorMessage}</p>
              </div>
            ) : responseData ? (
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-mono text-[11px]">
                {typeof responseData === 'string'
                  ? responseData
                  : JSON.stringify(responseData, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                <p className="text-xs">
                  {mode === 'send'
                    ? 'Pick a clinical template above, edit your JSON, and click "Send Payload" to transmit live data to your EHR.'
                    : 'Select a query preset or enter a custom path above, then click "Send GET Request".'}
                </p>
                <p className="mt-2 text-[11px] text-slate-600">
                  {mode === 'send'
                    ? 'Tip: Use the Validate Conformance ($validate) template to test compliance without persisting to the database.'
                    : 'Tip: Query CapabilityStatement (/metadata) to verify supported EHR resources and operations.'}
                </p>
              </div>
            )}
          </div>

          {/* Response Headers Footer */}
          {Object.keys(responseHeaders).length > 0 && (
            <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-500 flex flex-wrap gap-x-4">
              {responseHeaders['content-type'] && (
                <span>Content-Type: <strong className="text-slate-400">{responseHeaders['content-type']}</strong></span>
              )}
              {responseHeaders['etag'] && (
                <span>ETag: <strong className="text-slate-400">{responseHeaders['etag']}</strong></span>
              )}
              {responseHeaders['x-request-id'] && (
                <span>Request-ID: <strong className="text-slate-400">{responseHeaders['x-request-id']}</strong></span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
