const items = [
  {
    problem: 'Systems are disconnected',
    solution: 'Create a shared layer for records, lab results, device signals, and workflow events.',
  },
  {
    problem: 'Device data is hard to use',
    solution: 'Turn monitoring devices, wearables, IoT, and smart infrastructure signals into reviewable context.',
  },
  {
    problem: 'Teams need control',
    solution: 'Plan access, audit, validation, and human review before data moves into workflows.',
  },
  {
    problem: 'Knowledge gets scattered',
    solution: 'Use the professional stream and insights layer to keep implementation lessons visible.',
  },
]

export default function ProblemSolutionMatrix() {
  return (
    <section className="bg-slate-50 py-14 dark:bg-slate-900 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
            Why it matters
          </p>
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
            Make healthcare technology easier to connect and understand.
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
