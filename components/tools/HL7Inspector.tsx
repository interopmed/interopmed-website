'use client'

import { useState } from 'react'

const sampleMessages = {
  adt: `MSH|^~\\&|EMR_CLINICAL|HOSPITAL_A|INTEROPMED|HUB|20260614112000||ADT^A01|MSG-98214|P|2.5.1
EVN|A01|20260614112000
PID|1||PAT-98421^^^HOSPITAL||Perera^Kasun^Anuradha||19820412|M|||Colombo^^^Sri Lanka
PV1|1|I|WARD-3^BED-12^01||||DOC-041^Dissanayaka^Neranjan|||MED|||||||ADM-202606-01`,
  oru: `MSH|^~\\&|LIS_COBAS|CENTRAL_LAB|EMR_CLINICAL|HOSPITAL_A|20260614120000||ORU^R01|MSG-98215|P|2.5.1
PID|1||PAT-98421^^^HOSPITAL||Perera^Kasun^Anuradha||19820412|M
OBR|1|ORD-55412|LIS-8842|24357-6^Urinalysis panel^LN|||20260614113000|||||||||DOC-041^Dissanayaka^Neranjan
OBX|1|NM|2345-7^Glucose [Mass/vol] in Urine^LN|1|0|mg/dL|0-15|N|||F
OBX|2|NM|2888-6^Protein [Mass/vol] in Urine^LN|1|0|mg/dL|0-10|N|||F`,
}

export default function HL7Inspector() {
  const [activeSample, setActiveSample] = useState<'adt' | 'oru'>('oru')
  const [customPayload, setCustomPayload] = useState(sampleMessages.oru)

  const segments = customPayload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|')
      return {
        tag: parts[0],
        raw: line,
        fields: parts.slice(1),
      }
    })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            Message Parser
          </span>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            HL7 v2 Message Inspector & Segment Breakdown
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Inspect real-world ADT patient movement and ORU laboratory result messages.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSample('oru')
              setCustomPayload(sampleMessages.oru)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSample === 'oru'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Sample LIS ORU^R01 (Lab)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSample('adt')
              setCustomPayload(sampleMessages.adt)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSample === 'adt'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Sample EHR ADT^A01 (Admission)
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Raw HL7 v2 Pipe-Delimited Payload
          </label>
          <textarea
            rows={7}
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-slate-200 focus:border-teal-500 focus:outline-none dark:border-slate-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Parsed Segment Breakdown
          </label>
          <div className="space-y-2.5 max-h-[220px] overflow-auto pr-1">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center gap-2 font-mono font-bold text-teal-700 dark:text-teal-400">
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[11px] dark:bg-teal-950">
                    {seg.tag}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {seg.tag === 'MSH' && 'Message Header'}
                    {seg.tag === 'PID' && 'Patient Identification'}
                    {seg.tag === 'PV1' && 'Patient Visit / Encounter'}
                    {seg.tag === 'OBR' && 'Observation Request (Order)'}
                    {seg.tag === 'OBX' && 'Observation / Lab Result Segment'}
                    {seg.tag === 'EVN' && 'Event Type'}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-slate-600 truncate dark:text-slate-400">
                  {seg.raw}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
