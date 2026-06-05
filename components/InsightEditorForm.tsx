'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'

type FormState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

type InsightEditorInitialValue = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
  category?: string
  status?: string
  featuredImage?: string | null
  tags?: string[]
}

type InsightEditorFormProps = {
  initialValue?: InsightEditorInitialValue
  mode?: 'create' | 'edit'
  taxonomyOptions?: {
    categories: string[]
    tags: string[]
  }
}

const DEFAULT_CATEGORIES = [
  'interoperability',
  'fhir',
  'hl7-v2',
  'clinical-data',
  'governance',
  'compliance',
  'implementation',
  'industry',
]

function normalizeTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function uniqueTerms(values: string[]) {
  const seen = new Set<string>()

  return values
    .map(normalizeTerm)
    .filter((value) => {
      const key = value.toLowerCase()

      if (!value || seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

export default function InsightEditorForm({
  initialValue,
  mode = 'create',
  taxonomyOptions,
}: InsightEditorFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValue?.title || '')
  const [category, setCategory] = useState(initialValue?.category || 'interoperability')
  const [newCategory, setNewCategory] = useState('')
  const [tags, setTags] = useState<string[]>(initialValue?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [state, setState] = useState<FormState>({ status: 'idle', message: '' })
  const isEditing = mode === 'edit'
  const categories = uniqueTerms([
    ...(taxonomyOptions?.categories || []),
    ...(initialValue?.category ? [initialValue.category] : []),
    ...DEFAULT_CATEGORIES,
  ])
  const suggestedTags = uniqueTerms([
    ...(taxonomyOptions?.tags || []),
    ...(initialValue?.tags || []),
    'FHIR',
    'HL7',
    'data governance',
    'clinical workflows',
    'patient matching',
    'API strategy',
  ]).filter((tag) => !tags.some((selectedTag) => selectedTag.toLowerCase() === tag.toLowerCase()))

  function addTag(value: string) {
    const nextTag = normalizeTerm(value)

    if (!nextTag) {
      return
    }

    setTags((currentTags) => uniqueTerms([...currentTags, nextTag]))
    setTagInput('')
  }

  function removeTag(value: string) {
    setTags((currentTags) => currentTags.filter((tag) => tag.toLowerCase() !== value.toLowerCase()))
  }

  function addCategory() {
    const nextCategory = normalizeTerm(newCategory)

    if (!nextCategory) {
      return
    }

    setCategory(nextCategory)
    setNewCategory('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: isEditing ? 'Saving insight...' : 'Creating insight...' })

    const formData = new FormData(event.currentTarget)
    const selectedTags = String(formData.get('tags') || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const response = await fetch(isEditing ? `/api/insights/${initialValue?.id}` : '/api/insights', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: formData.get('slug') || slugify(title),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        category,
        status: formData.get('status'),
        featuredImage: formData.get('featuredImage'),
        tags: selectedTags,
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      setState({
        status: 'error',
        message: result.error || (isEditing ? 'Failed to save insight' : 'Failed to create insight'),
      })
      return
    }

    setState({ status: 'success', message: isEditing ? 'Insight saved.' : 'Insight created successfully.' })

    if (isEditing) {
      router.refresh()
      return
    }

    event.currentTarget.reset()
    setTitle('')
    setCategory('interoperability')
    setTags([])
    setTagInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Title</span>
          <input
            required
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Slug</span>
          <input
            type="text"
            name="slug"
            defaultValue={initialValue?.slug || ''}
            placeholder={title ? slugify(title) : 'generated-from-title'}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Status</span>
          <select
            name="status"
            defaultValue={initialValue?.status || 'draft'}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Featured Image URL</span>
          <input
            type="text"
            name="featuredImage"
            defaultValue={initialValue?.featuredImage || ''}
            placeholder="/generated/insights/example.png"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Categories</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose one primary article category.</p>
            </div>
            <input type="hidden" name="category" value={category} />
          </div>

          <div className="mt-4 grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {categories.map((item) => (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                  category.toLowerCase() === item.toLowerCase()
                    ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  checked={category.toLowerCase() === item.toLowerCase()}
                  onChange={() => setCategory(item)}
                  className="h-4 w-4 accent-teal-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCategory()
                }
              }}
              placeholder="Add new category"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={addCategory}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300"
            >
              Add
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tags</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add article tags, separated like WordPress post tags.</p>
            </div>
            <input type="hidden" name="tags" value={tags.join(', ')} />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault()
                  addTag(tagInput)
                }
              }}
              placeholder="Add tag"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-800 transition hover:border-red-300 hover:text-red-700 dark:border-teal-900 dark:bg-slate-950 dark:text-teal-200 dark:hover:border-red-800 dark:hover:text-red-300"
                  title="Remove tag"
                >
                  {tag} x
                </button>
              ))}
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Suggestions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Excerpt</span>
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={initialValue?.excerpt || ''}
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Content</span>
        <textarea
          required
          name="content"
          rows={14}
          defaultValue={initialValue?.content || ''}
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        {state.status === 'submitting' ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save changes' : 'Create insight'}
      </button>

      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
