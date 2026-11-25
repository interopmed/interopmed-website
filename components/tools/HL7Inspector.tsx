'use client'

import { useState } from 'react'
import { STUDIO_URL } from '@/lib/studio-constants'

const sampleMessages = {
  oru: `MSH|^~\\&|LIS_COBAS|CENTRAL_LAB|EMR_CLINICAL|HOSPITAL_A|20261125143000||ORU^R01|MSG-98215|P|2.5.1
PID|1||PAT-98421^^^HOSPITAL^MRN||Perera^Kasun^Anuradha||19820412|M|||Colombo^^^Sri Lanka
PV1|1|I|WARD-3^BED-12^01||||DOC-041^Dissanayaka^Neranjan|||MED|||||||ADM-202611-01
OBR|1|ORD-55412|LIS-8842|24357-6^Urinalysis macro panel^LN|||20261125142000|||||||||DOC-041^Dissanayaka^Neranjan
OBX|1|NM|2345-7^Glucose [Mass/vol] in Urine^LN|1|0|mg/dL|0-15|N|||F
OBX|2|NM|2888-6^Protein [Mass/vol] in Urine^LN|1|0|mg/dL|0-10|N|||F
OBX|3|ST|5770-3^Color of Urine^LN|1|Yellow|||N|||F`,
  adt: `MSH|^~\\&|EMR_CLINICAL|HOSPITAL_A|INTEROPMED|HUB|20261125100000||ADT^A01|MSG-98214|P|2.5.1
EVN|A01|20261125100000
PID|1||PAT-98421^^^HOSPITAL^MRN||Perera^Kasun^Anuradha||19820412|M|||Colombo^^^Sri Lanka
PV1|1|I|WARD-3^BED-12^01||||DOC-041^Dissanayaka^Neranjan|||MED|||||||ADM-202611-01`,
  orm: `MSH|^~\\&|EMR_CLINICAL|HOSPITAL_A|LIS_COBAS|CENTRAL_LAB|20261125110000||ORM^O01|MSG-98216|P|2.5.1
PID|1||PAT-98421^^^HOSPITAL^MRN||Perera^Kasun^Anuradha||19820412|M
PV1|1|I|WARD-3^BED-12^01
ORC|NW|ORD-55412|||||1^once^^20261125110000||20261125110000|DOC-041^Dissanayaka^Neranjan
OBR|1|ORD-55412||24357-6^Urinalysis macro panel^LN|||20261125110000`,
}

type ParsedField = {
  index: number
  raw: string
  components: string[]
}

type ParsedSegment = {
  tag: string
  name: string
  raw: string
  fields: ParsedField[]
}

type LintIssue = {
  level: 'error' | 'warning' | 'info'
  segment: string
  message: string
}

function getSegmentName(tag: string): string {
  const map: Record<string, string> = {
    MSH: 'Message Header',
    PID: 'Patient Identification',
    PV1: 'Patient Visit / Encounter',
    EVN: 'Event Type',
    OBR: 'Observation Request (Order)',
    OBX: 'Observation / Result Segment',
    ORC: 'Common Order',
    DG1: 'Diagnosis',
    AL1: 'Patient Allergy Information',
    NTE: 'Notes and Comments',
    SPM: 'Specimen',
  }
  return map[tag] || 'Custom / Extension Segment'
}

function parseHL7(raw: string): { segments: ParsedSegment[]; lintIssues: LintIssue[] } {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const segments: ParsedSegment[] = []
  const lintIssues: LintIssue[] = []

  let foundMsh = false

  lines.forEach((line, lineIdx) => {
    const parts = line.split('|')
    const tag = parts[0]

    if (lineIdx === 0 && tag !== 'MSH') {
      lintIssues.push({
        level: 'error',
        segment: 'ROOT',
        message: 'First line must be MSH (Message Header). Received: ' + tag,
      })
    }

    if (tag === 'MSH') {
      foundMsh = true
      // MSH-1 is the pipe separator itself, so parts[1] is MSH-2 (Encoding characters)
      const encodingChars = parts[1] || ''
      if (!encodingChars.startsWith('^~\\&')) {
        lintIssues.push({
          level: 'warning',
          segment: 'MSH',
          message: `Expected standard encoding characters "^~\\&" in MSH-2, got "${encodingChars}"`,
        })
      }

      const msgType = parts[8] // MSH-9
      if (!msgType) {
        lintIssues.push({
          level: 'error',
          segment: 'MSH',
          message: 'MSH-9 (Message Type) is mandatory but missing.',
        })
      } else if (!msgType.includes('^')) {
        lintIssues.push({
          level: 'warning',
          segment: 'MSH',
          message: `MSH-9 should include trigger event (e.g. ORU^R01, ADT^A01). Found: "${msgType}"`,
        })
      }

      const controlId = parts[9] // MSH-10
      if (!controlId) {
        lintIssues.push({
          level: 'error',
          segment: 'MSH',
          message: 'MSH-10 (Message Control ID) is mandatory for message tracking.',
        })
      }

      const version = parts[11] // MSH-12
      if (!version) {
        lintIssues.push({
          level: 'warning',
          segment: 'MSH',
          message: 'MSH-12 (HL7 Version ID) is missing (recommended: 2.5 or 2.5.1).',
        })
      }
    }

    if (tag === 'PID') {
      const pid3 = parts[3]
      if (!pid3) {
        lintIssues.push({
          level: 'error',
          segment: 'PID',
          message: 'PID-3 (Patient Identifier List / MRN) is required.',
        })
      }
      const pid5 = parts[5]
      if (!pid5) {
        lintIssues.push({
          level: 'warning',
          segment: 'PID',
          message: 'PID-5 (Patient Name) is empty.',
        })
      }
    }

    if (tag === 'OBX') {
      const valueType = parts[2] // OBX-2
      const obsCode = parts[3] // OBX-3
      const obsValue = parts[5] // OBX-5

      if (!obsCode) {
        lintIssues.push({
          level: 'error',
          segment: 'OBX',
          message: 'OBX-3 (Observation Identifier) is mandatory.',
        })
      }
      if (valueType === 'NM' && obsValue && isNaN(Number(obsValue))) {
        lintIssues.push({
          level: 'error',
          segment: 'OBX',
          message: `OBX-2 specifies Numeric (NM) but value "${obsValue}" in OBX-5 is non-numeric.`,
        })
      }
    }

    const fieldList: ParsedField[] = parts.slice(1).map((rawField, fIdx) => ({
      index: tag === 'MSH' ? fIdx + 2 : fIdx + 1,
      raw: rawField,
      components: rawField.split('^'),
    }))

    segments.push({
      tag,
      name: getSegmentName(tag),
      raw: line,
      fields: fieldList,
    })
  })

  if (!foundMsh && lines.length > 0) {
    lintIssues.push({
      level: 'error',
      segment: 'MSH',
      message: 'No MSH header found in payload.',
    })
  }

  return { segments, lintIssues }
}

export default function HL7Inspector() {
  const [activeSample, setActiveSample] = useState<'oru' | 'adt' | 'orm'>('oru')
  const [customPayload, setCustomPayload] = useState(sampleMessages.oru)
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  const { segments, lintIssues } = parseHL7(customPayload)
  const activeSegment = segments[selectedSegmentIdx] || segments[0]

  const errorCount = lintIssues.filter((i) => i.level === 'error').length
  const warningCount = lintIssues.filter((i) => i.level === 'warning').length

  const handleCopy = () => {
    navigator.clipboard.writeText(customPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      {/* Title & Presets */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              Conformance &amp; Segment Inspector
            </span>
            <span className="text-xs font-semibold text-slate-500">v2.x Clinical Linter</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            HL7 v2 Message Linter &amp; Deep Subfield Inspector
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Paste raw hospital EHR or LIS feeds to validate syntax, field cardinality, LOINC/SNOMED codes, and decompose composite components.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSample('oru')
              setCustomPayload(sampleMessages.oru)
              setSelectedSegmentIdx(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSample === 'oru'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            LIS ORU^R01 (Lab Result)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSample('adt')
              setCustomPayload(sampleMessages.adt)
              setSelectedSegmentIdx(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSample === 'adt'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            EHR ADT^A01 (Admit)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSample('orm')
              setCustomPayload(sampleMessages.orm)
              setSelectedSegmentIdx(0)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSample === 'orm'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            CPOE ORM^O01 (Order)
          </button>
        </div>
      </div>

      {/* Conformance Summary Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Validation Status:</span>
          {errorCount === 0 && warningCount === 0 ? (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              ✓ Valid HL7 Structure
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                  {errorCount} Error{errorCount > 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  {warningCount} Warning{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          <span className="text-xs text-slate-400">({segments.length} segments parsed)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
          >
            {copied ? '✓ Copied' : 'Copy Payload'}
          </button>
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Map to FHIR in Studio ↗
          </a>
        </div>
      </div>

      {/* Lint Issues Box if any */}
      {lintIssues.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
            Conformance Warnings &amp; Rule Violations
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-amber-800 dark:text-amber-300/90">
            {lintIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                    issue.level === 'error' ? 'bg-rose-600 text-white' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {issue.segment}
                </span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Two-Column Inspector */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.1fr]">
        {/* Left: Input Textarea & Segment List */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Raw HL7 v2 Feed (Editable)
            </label>
            <textarea
              rows={8}
              value={customPayload}
              onChange={(e) => {
                setCustomPayload(e.target.value)
                setSelectedSegmentIdx(0)
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-slate-200 focus:border-teal-500 focus:outline-none dark:border-slate-700"
              placeholder="Paste raw MSH|^~\&|... message here"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Click Segment to Decompose
            </label>
            <div className="space-y-1.5 max-h-[260px] overflow-auto pr-1">
              {segments.map((seg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSegmentIdx(idx)}
                  className={`w-full rounded-xl border p-2.5 text-left text-xs transition ${
                    selectedSegmentIdx === idx
                      ? 'border-teal-500 bg-teal-50/60 shadow-sm dark:border-teal-600 dark:bg-teal-950/40'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{seg.tag}</span>
                    <span className="text-[11px] text-slate-500">{seg.name}</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-slate-600 truncate dark:text-slate-400">
                    {seg.raw}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Component & Subfield Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Deep Field Inspector
            </span>
            <h4 className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {activeSegment ? `${activeSegment.tag} - ${activeSegment.name}` : 'Select a Segment'}
            </h4>
          </div>

          {activeSegment ? (
            <div className="mt-4 space-y-3 max-h-[460px] overflow-auto pr-1">
              {activeSegment.fields.map((field, fIdx) => (
                <div
                  key={fIdx}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {activeSegment.tag}-{field.index}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {field.components.length > 1
                        ? `${field.components.length} components (^)`
                        : 'Atomic field'}
                    </span>
                  </div>

                  <p className="mt-1.5 font-mono text-xs text-slate-800 break-words dark:text-slate-200">
                    {field.raw || <span className="text-slate-400 italic">empty</span>}
                  </p>

                  {/* Component Breakdown if composite */}
                  {field.components.length > 1 && (
                    <div className="mt-2.5 rounded bg-slate-50 p-2 text-[11px] dark:bg-slate-950">
                      <span className="font-semibold text-slate-500 block mb-1">Components (^):</span>
                      <div className="space-y-1">
                        {field.components.map((comp, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-2 font-mono">
                            <span className="text-slate-400">^{cIdx + 1}:</span>
                            <span className="text-teal-700 dark:text-teal-300 font-medium break-all">
                              {comp || '<empty>'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-slate-500">
              Select any segment on the left to inspect its individual fields and subcomponents.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
