'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type TaxonomyTerm = {
  id: string
  name: string
  slug: string
  taxonomy: string
  count: number
  description?: string | null
}

type TaxonomyManagerProps = {
  terms: TaxonomyTerm[]
  taxonomy: 'category' | 'post_tag'
  title: string
  emptyMessage: string
}

type FormState = {
  status: 'idle' | 'submitting' | 'error' | 'success'
  message: string
}

export default function TaxonomyManager({
  terms,
  taxonomy,
  title,
  emptyMessage,
}: TaxonomyManagerProps) {
  const router = useRouter()
  const [state, setState] = useState<FormState>({ status: 'idle', message: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const filteredTerms = terms.filter((term) => term.taxonomy === taxonomy)

  async function submitTerm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const id = String(formData.get('id') || '')
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()

    if (!name) {
      setState({ status: 'error', message: 'Name is required.' })
      return
    }

    setState({ status: 'submitting', message: id ? 'Updating taxonomy...' : 'Creating taxonomy...' })
    const response = await fetch(id ? `/api/taxonomies/${id}` : '/api/taxonomies', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, taxonomy, description }),
    })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The taxonomy endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to save taxonomy.' })
      return
    }

    event.currentTarget.reset()
    setEditingId(null)
    setState({ status: 'success', message: id ? 'Taxonomy updated.' : 'Taxonomy created.' })
    router.refresh()
  }

  async function deleteTerm(term: TaxonomyTerm) {
    setState({ status: 'submitting', message: `Deleting ${term.name}...` })
    const response = await fetch(`/api/taxonomies/${term.id}`, { method: 'DELETE' })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The taxonomy endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to delete taxonomy.' })
      return
    }

    setState({ status: 'success', message: 'Taxonomy deleted.' })
    router.refresh()
  }

  const editingTerm = filteredTerms.find((term) => term.id === editingId)

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={submitTerm} className="h-fit rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <input type="hidden" name="id" value={editingTerm?.id || ''} />
        <input type="hidden" name="taxonomy" value={taxonomy} />
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
          {editingTerm ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
        </h2>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Name</span>
          <input
            key={editingTerm?.id || 'new-name'}
            required
            name="name"
            defaultValue={editingTerm?.name || ''}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Description</span>
          <textarea
            key={editingTerm?.id || 'new-description'}
            name="description"
            rows={4}
            defaultValue={editingTerm?.description || ''}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={state.status === 'submitting'}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {editingTerm ? `Save ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
          </button>
          {editingTerm && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          )}
        </div>

        {state.message && (
          <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {state.message}
          </p>
        )}
      </form>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-[1fr_80px_140px] gap-3 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>Name</span>
          <span>Count</span>
          <span>Actions</span>
        </div>

        {filteredTerms.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredTerms.map((term) => (
              <article key={term.id} className="grid grid-cols-[1fr_80px_140px] gap-3 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950 dark:text-white">{term.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{term.slug}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{term.count}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(term.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={term.count > 0 || state.status === 'submitting'}
                    onClick={() => deleteTerm(term)}
                    className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-5 text-sm text-slate-600 dark:text-slate-400">
            {emptyMessage}
          </p>
        )}
      </section>
    </div>
  )
}
