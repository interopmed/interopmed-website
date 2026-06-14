type UserPageLoadingProps = {
  variant?: 'dashboard' | 'profile' | 'activity' | 'notifications' | 'settings' | 'security' | 'support' | 'login'
}

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />
}

function Panel({
  children,
  className = '',
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </div>
  )
}

function Header() {
  return (
    <div className="space-y-3">
      <Bar className="h-3 w-28" />
      <Bar className="h-7 w-56 max-w-full" />
      <Bar className="h-4 w-full max-w-lg" />
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <Panel className="w-full max-w-md space-y-4">
        <Bar className="mx-auto h-10 w-10" />
        <Bar className="mx-auto h-7 w-40" />
        <Bar className="h-11 w-full" />
        <Bar className="h-11 w-full" />
        <Bar className="h-11 w-full" />
      </Panel>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
      <Panel className="h-56" />
      <section className="space-y-5">
        <Panel className="space-y-4">
          <Header />
          <Bar className="h-24 w-full" />
        </Panel>
        <Panel className="space-y-3">
          <Bar className="h-5 w-40" />
          <Bar className="h-16 w-full" />
          <Bar className="h-16 w-full" />
        </Panel>
      </section>
      <Panel className="h-64" />
    </div>
  )
}

function StandardLoading({ variant }: { variant: UserPageLoadingProps['variant'] }) {
  const isThreeColumn = variant === 'profile'
  const isForm = variant === 'settings' || variant === 'security' || variant === 'support'

  return (
    <div className={isThreeColumn ? 'grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_280px]' : 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]'}>
      {isThreeColumn && <Panel className="h-64" />}
      <section className="space-y-5">
        <Panel className="space-y-5">
          <Header />
          {isForm ? (
            <>
              <Bar className="h-11 w-full" />
              <Bar className="h-11 w-full" />
              <Bar className="h-10 w-32" />
            </>
          ) : (
            <>
              <Bar className="h-20 w-full" />
              <Bar className="h-20 w-full" />
              <Bar className="h-20 w-full" />
            </>
          )}
        </Panel>
      </section>
      <Panel className="h-52" />
    </div>
  )
}

export default function UserPageLoading({ variant = 'dashboard' }: UserPageLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className="min-h-full animate-pulse bg-slate-100 py-4 dark:bg-slate-950 md:py-6"
    >
      <span className="sr-only">Loading...</span>
      {variant === 'login' ? (
        <LoginLoading />
      ) : variant === 'dashboard' ? (
        <DashboardLoading />
      ) : (
        <StandardLoading variant={variant} />
      )}
    </main>
  )
}
