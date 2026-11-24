'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type ArticleCard = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingTime: string
  featuredImage?: string | null
}

interface ArticlesDirectoryProps {
  articles: ArticleCard[]
}

function getCategoryBadgeClass(category: string) {
  const norm = category.toLowerCase()
  if (norm.includes('interop')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  }
  if (norm.includes('informatic') || norm.includes('clinical')) {
    return 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60'
  }
  if (norm.includes('standard')) {
    return 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60'
  }
  if (norm.includes('implement')) {
    return 'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60'
  }
  return 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60'
}

function getAuthorInitials(name: string) {
  const clean = name.replace(/^Dr\.\s*/i, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase() || 'IM'
}

export default function ArticlesDirectory({ articles }: ArticlesDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return ['All', ...Array.from(set)]
  }, [articles])

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        article.category.toLowerCase() === selectedCategory.toLowerCase()

      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [articles, selectedCategory, searchQuery])

  const featured = articles[0]
  const isFiltering = selectedCategory !== 'All' || searchQuery.trim().length > 0
  const displayList = isFiltering ? filteredArticles : filteredArticles.slice(1)

  return (
    <div className="space-y-12">
      {/* Featured Lead Story (shown when no search/category filter is active) */}
      {!isFiltering && featured && (
        <section className="pt-2">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-300 hover:border-teal-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-teal-500 md:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Lead Story Content */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getCategoryBadgeClass(
                      featured.category
                    )}`}
                  >
                    {featured.category}
                  </span>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    Lead Publication
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {featured.publishedAt}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {featured.readingTime}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400 sm:text-3xl lg:text-4xl">
                  <Link href={`/articles/${featured.slug}`}>
                    {featured.title}
                  </Link>
                </h2>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {featured.excerpt}
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                      {getAuthorInitials(featured.author)}
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {featured.author}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Peer-reviewed technical guide
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/articles/${featured.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-400 dark:hover:text-slate-950"
                  >
                    <span>Read Full Guide</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Architectural Highlights Card */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Key Concepts &amp; Standards</span>
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  </div>

                  <ul className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">&check;</span>
                      <span>Decoupling point-to-point interface engines with RESTful web standards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">&check;</span>
                      <span>Common Resource building blocks: Patient, Observation, DiagnosticReport</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">&check;</span>
                      <span>Real-time bedside data flow protecting patient safety during triage</span>
                    </li>
                  </ul>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                    {['FHIR R4', 'HL7 v2', 'JSON', 'REST APIs', 'USCDI'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Navigation Bar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((category) => {
              const active = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950'
                      : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides or topics..."
              className="w-full rounded-full border border-slate-200/90 bg-white px-4 py-1.5 pl-9 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400"
            />
            <svg
              className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Status / Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredArticles.length}</strong> of{' '}
            {articles.length} publications
          </span>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
              }}
              className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Publications Grid */}
      <section>
        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching publications found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try searching for different keywords such as &ldquo;FHIR&rdquo;, &ldquo;LOINC&rdquo;, or &ldquo;EMR&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
              }}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayList.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-teal-500"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeClass(
                        article.category
                      )}`}
                    >
                      {article.category}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      {article.readingTime}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-base font-bold leading-snug text-slate-950 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-300">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {getAuthorInitials(article.author)}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {article.author}
                      </span>
                    </div>

                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 dark:text-teal-400"
                      aria-label={`Read ${article.title}`}
                    >
                      <span>Read</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    {article.publishedAt}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Practical Healthcare Sandbox Callout */}
      <section className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-transparent p-7 dark:border-teal-500/20 dark:from-teal-950/20 dark:via-cyan-950/20 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Interactive Clinical Sandboxes
            </span>
            <h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
              Turn clinical standards into working implementations
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Validate HL7 v2 and FHIR R4 messages in our visual parser, simulate live CPOE-to-LIS specimen workflows in SHIN EHR, or ask InteropMind for mapping advice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-300"
            >
              <span>HL7 &amp; FHIR Parser</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/ehr-lis"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-400"
            >
              <span>SHIN EHR/LIS Simulator</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
