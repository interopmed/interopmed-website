const items = [
  {
    problem: 'Too many locked systems',
    solution: 'Connect systems using common healthcare standards, so your data is easier to move, share, and reuse.',
  },
  {
    problem: 'Patient data is scattered',
    solution: 'Bring patient, visit, result, and document information into a clearer structure that teams can understand.',
  },
  {
    problem: 'Clinical apps need fast answers',
    solution: 'Organize data so dashboards, APIs, and care tools can find the right information more reliably.',
  },
  {
    problem: 'Trust is hard to manage',
    solution: 'Add checks for access, data quality, audit history, and review steps before information is shared.',
  },
]

export default function ProblemSolutionMatrix() {
  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-900 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
            Why it matters
          </p>
          <h2 className="text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
            Make healthcare data easier to connect, check, and trust.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={item.problem}
              className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500 md:p-8"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                  {item.problem}
                </h3>
              </div>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                {item.solution}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
