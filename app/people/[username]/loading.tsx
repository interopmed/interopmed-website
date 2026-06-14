export default function MemberProfileLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f3f5f7] px-4 py-7 dark:bg-slate-950 md:px-6 md:py-10">
      <div className="mx-auto max-w-[1180px] space-y-7">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-slate-900">
          <div className="h-48 bg-slate-800 md:h-60" />
          <div className="space-y-5 px-7 pb-8">
            <div className="-mt-16 h-32 w-32 rounded-full border-[6px] border-white bg-slate-200 dark:border-slate-900 dark:bg-slate-800" />
            <div className="h-8 w-72 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="h-[460px] rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
          <div className="space-y-5">
            <div className="h-56 rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
            <div className="h-72 rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
          </div>
        </div>
      </div>
    </main>
  )
}
