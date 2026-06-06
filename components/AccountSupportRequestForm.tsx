'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type SupportState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function AccountSupportRequestForm() {
  const router = useRouter()
  const [state, setState] = useState<SupportState>({ status: 'idle', message: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setState({ status: 'submitting', message: 'Sending support request...' })

    const response = await fetch('/api/account/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: formData.get('topic'),
        urgency: formData.get('urgency'),
        message: formData.get('message'),
      }),
    })

    const result = await response.json().catch(() => ({
      success: false,
      error: 'The support endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to send support request.' })
      return
    }

    form.reset()
    setState({ status: 'success', message: 'Support request sent.' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Support</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Create request</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Topic</span>
          <select
            required
            name="topic"
            defaultValue="Account help"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option>Account help</option>
            <option>Studio access</option>
            <option>FHIR or HL7 workflow</option>
            <option>Billing or subscription</option>
            <option>Bug report</option>
            <option>Other</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Urgency</span>
          <select
            name="urgency"
            defaultValue="normal"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Message</span>
          <textarea
            required
            name="message"
            rows={7}
            minLength={20}
            placeholder="Describe what happened, what you expected, and any affected workflow."
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
      >
        {state.status === 'submitting' ? 'Sending...' : 'Send request'}
      </button>
      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
