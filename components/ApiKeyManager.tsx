'use client'

import { useState, useEffect } from 'react'

type ApiKeyItem = {
  id: string
  name: string
  keyPrefix: string
  environment: 'live' | 'test'
  scopes: string[]
  rateLimit: number
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

type NewlyCreatedKey = {
  secretKey: string
  name: string
  keyPrefix: string
  environment: string
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Creation form state
  const [isCreating, setIsCreating] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEnv, setFormEnv] = useState<'live' | 'test'>('live')
  const [formScopes, setFormScopes] = useState<string[]>(['read', 'write', 'fhir'])
  const [formExpiryDays, setFormExpiryDays] = useState<number | null>(null)
  const [createSubmitting, setCreateSubmitting] = useState(false)

  // Newly generated secret reveal modal
  const [newKeyModal, setNewKeyModal] = useState<NewlyCreatedKey | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Code snippet tab state
  const [codeTab, setCodeTab] = useState<'curl' | 'python' | 'ts'>('curl')

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/account/api-keys')
      const json = await res.json()
      if (json.success) {
        setKeys(json.data || [])
      } else {
        setError(json.error || 'Failed to load API keys')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error loading keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    setCreateSubmitting(true)
    try {
      const res = await fetch('/api/account/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          environment: formEnv,
          scopes: formScopes,
          expiresInDays: formExpiryDays,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setNewKeyModal({
          secretKey: json.data.secretKey,
          name: json.data.apiKey.name,
          keyPrefix: json.data.apiKey.keyPrefix,
          environment: json.data.apiKey.environment,
        })
        setFormName('')
        setIsCreating(false)
        fetchKeys()
      } else {
        alert(json.error || 'Failed to issue API key')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating API key')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke API key "${name}"? Any hospital integrations or scripts using this key will immediately stop working.`)) {
      return
    }

    try {
      const res = await fetch(`/api/account/api-keys/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        fetchKeys()
      } else {
        alert(json.error || 'Failed to revoke key')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error revoking key')
    }
  }

  const copySecretKey = () => {
    if (!newKeyModal) return
    navigator.clipboard.writeText(newKeyModal.secretKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2500)
  }

  const activeKeySample = newKeyModal?.secretKey || 'im_live_a1b2c3d4e5f6g7h8i9j0k1l2'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              Developer Credentials
            </span>
            <span className="text-xs font-semibold text-slate-500">API Key Issuing System</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            Programmatic API Keys
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Issue cryptographically secure API keys to authenticate EHR systems, hospital integration pipelines, and automated scripts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
        >
          <span>{isCreating ? '✕ Cancel' : '+ Issue New API Key'}</span>
        </button>
      </div>

      {/* NEW KEY REVEAL MODAL */}
      {newKeyModal && (
        <div className="my-6 rounded-2xl border border-emerald-500/80 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <span className="text-lg">🎉</span>
            <h4 className="text-sm font-bold">API Key Issued Successfully!</h4>
          </div>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            Copy this secret key right now. For security purposes, <strong>it will never be displayed again</strong>.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={newKeyModal.secretKey}
              className="flex-1 rounded-xl border border-emerald-400 bg-white px-4 py-2.5 font-mono text-xs font-bold text-slate-950 dark:border-emerald-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={copySecretKey}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {copiedKey ? '✓ Copied to Clipboard!' : 'Copy Key'}
            </button>
            <button
              type="button"
              onClick={() => setNewKeyModal(null)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW KEY FORM */}
      {isCreating && (
        <form onSubmit={handleCreateKey} className="my-6 rounded-2xl border border-teal-200 bg-teal-50/30 p-5 dark:border-teal-900/60 dark:bg-teal-950/20">
          <h4 className="text-sm font-bold text-slate-950 dark:text-white">Configure New API Key</h4>
          <p className="mt-0.5 text-xs text-slate-500">Provide an identifier and choose appropriate scopes and environment.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Key Name / Label
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Hospital EHR Staging Connector"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Target Environment
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormEnv('live')}
                  className={`flex-1 rounded-xl border p-2 text-xs font-bold transition ${
                    formEnv === 'live'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  Production (im_live_*)
                </button>
                <button
                  type="button"
                  onClick={() => setFormEnv('test')}
                  className={`flex-1 rounded-xl border p-2 text-xs font-bold transition ${
                    formEnv === 'test'
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  Sandbox / Test (im_test_*)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Expiration Policy
              </label>
              <select
                value={formExpiryDays === null ? 'never' : formExpiryDays}
                onChange={(e) => setFormExpiryDays(e.target.value === 'never' ? null : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="never">Never expires (Recommended for automated services)</option>
                <option value="30">Expires in 30 days</option>
                <option value="90">Expires in 90 days</option>
                <option value="365">Expires in 1 year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Allowed Scopes
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['read', 'write', 'fhir', 'studio'].map((scope) => (
                  <label key={scope} className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formScopes.includes(scope)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormScopes([...formScopes, scope])
                        } else {
                          setFormScopes(formScopes.filter((s) => s !== scope))
                        }
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-mono">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {createSubmitting ? 'Generating...' : 'Generate & Issue Key'}
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE API KEYS TABLE */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Your Active Credentials ({keys.length})
        </h4>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading API keys...</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-xs text-rose-300">
            {error}
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No API keys created yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Click &quot;+ Issue New API Key&quot; above to generate your first credential for programmatic access.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Name / Description</th>
                  <th className="pb-3 font-semibold">Key Identifier</th>
                  <th className="pb-3 font-semibold">Environment</th>
                  <th className="pb-3 font-semibold">Scopes</th>
                  <th className="pb-3 font-semibold">Created / Last Used</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                      <div>{k.name}</div>
                      {!k.isActive && (
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {k.keyPrefix}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          k.environment === 'live'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                        }`}
                      >
                        {k.environment}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <div>Created {new Date(k.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {k.lastUsedAt
                          ? `Used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                          : 'Never used'}
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      {k.isActive ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.id, k.name)}
                          className="rounded-lg border border-rose-300 px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEVELOPER INTEGRATION CODE SAMPLES */}
      <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-950 dark:text-white">How to Authenticate with Your API Key</h4>
            <p className="text-xs text-slate-500">Pass your key via standard <code className="font-mono text-[11px]">Authorization: Bearer &lt;key&gt;</code> or <code className="font-mono text-[11px]">x-api-key: &lt;key&gt;</code> headers.</p>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setCodeTab('curl')}
              className={`rounded px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                codeTab === 'curl' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              cURL
            </button>
            <button
              type="button"
              onClick={() => setCodeTab('python')}
              className={`rounded px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                codeTab === 'python' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Python
            </button>
            <button
              type="button"
              onClick={() => setCodeTab('ts')}
              className={`rounded px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                codeTab === 'ts' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Node.js / TS
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
          {codeTab === 'curl' && (
            <pre className="leading-relaxed">
{`# Authenticate cURL request with your InteropMed API key
curl -X POST https://www.interopmed.com/api/fhir/proxy \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://r4.smarthealthit.org/Patient?_count=1", "method": "GET"}'`}
            </pre>
          )}

          {codeTab === 'python' && (
            <pre className="leading-relaxed">
{`import os, requests

API_KEY = os.getenv("INTEROPMED_API_KEY", "${activeKeySample}")
url = "https://www.interopmed.com/api/fhir/proxy"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "url": "https://r4.smarthealthit.org/Patient?_count=1",
    "method": "GET"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`}
            </pre>
          )}

          {codeTab === 'ts' && (
            <pre className="leading-relaxed">
{`const apiKey = process.env.INTEROPMED_API_KEY || '${activeKeySample}';

const response = await fetch('https://www.interopmed.com/api/fhir/proxy', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://r4.smarthealthit.org/Patient?_count=1',
    method: 'GET',
  }),
});

const data = await response.json();
console.log(data);`}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
