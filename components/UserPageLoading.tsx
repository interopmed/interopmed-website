type UserPageLoadingProps = {
  variant?: 'dashboard' | 'profile' | 'activity' | 'notifications' | 'settings' | 'security' | 'support' | 'login'
}

const items = Array.from({ length: 6 }, (_, index) => index)

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-slate-200 dark:bg-slate-800 ${className}`} />
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

function Breadcrumb() {
  return <Bar className="mb-5 h-4 w-44" />
}

function PageHeading() {
  return (
    <div className="space-y-3">
      <Bar className="h-3 w-24" />
      <Bar className="h-8 w-64 max-w-full" />
      <Bar className="h-4 w-full max-w-xl" />
    </div>
  )
}

function ProfileLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
        <aside className="space-y-5">
          <Panel className="h-80" />
          <Panel className="h-44" />
          <Panel className="h-64" />
          <Panel className="h-36" />
        </aside>
        <section className="space-y-5">
          <Panel className="h-64" />
          <Panel className="space-y-4">
            <Bar className="h-6 w-44" />
            {items.slice(0, 3).map((item) => (
              <Bar key={item} className="h-40 w-full" />
            ))}
          </Panel>
        </section>
        <aside className="space-y-5">
          <Panel className="h-80" />
          <Panel className="h-56" />
          <Panel className="h-72" />
          <Panel className="h-40" />
        </aside>
      </div>
    </>
  )
}

function ActivityLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="space-y-5 lg:col-span-2">
          <Bar className="h-4 w-20" />
          <Bar className="h-8 w-64" />
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {items.map((item) => (
              <div key={item} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Bar className="h-4 w-52" />
                  <Bar className="h-3 w-full" />
                  <Bar className="h-3 w-32" />
                </div>
                <Bar className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Panel>
        <aside className="space-y-5">
          <Panel className="h-64" />
          <Panel className="h-44" />
        </aside>
      </div>
    </>
  )
}

function NotificationsLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel className="space-y-5">
          <PageHeading />
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {items.map((item) => (
              <div key={item} className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Bar className="h-5 w-64 max-w-full" />
                  <Bar className="h-3 w-full" />
                  <Bar className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Bar className="h-4 w-20" />
                  <Bar className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <aside className="space-y-5">
          <Panel className="h-80" />
          <Panel className="h-52" />
        </aside>
      </div>
    </>
  )
}

function SettingsLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <Panel className="space-y-5">
            <PageHeading />
            {items.slice(0, 3).map((item) => (
              <div key={item} className="space-y-2">
                <Bar className="h-3 w-28" />
                <Bar className="h-11 w-full" />
              </div>
            ))}
            <Bar className="h-10 w-32" />
          </Panel>
          <Panel className="space-y-4">
            <Bar className="h-6 w-64" />
            {items.slice(0, 5).map((item) => (
              <Bar key={item} className="h-14 w-full" />
            ))}
            <Bar className="h-10 w-36" />
          </Panel>
        </section>
        <Panel className="h-52" />
      </div>
    </>
  )
}

function SecurityLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <Panel className="h-80 space-y-4">
            <PageHeading />
            <Bar className="h-11 w-full" />
            <Bar className="h-11 w-full" />
            <Bar className="h-10 w-36" />
          </Panel>
          <Panel className="space-y-4">
            <Bar className="h-6 w-44" />
            {items.slice(0, 5).map((item) => (
              <Bar key={item} className="h-20 w-full" />
            ))}
          </Panel>
        </section>
        <aside className="space-y-5">
          <Panel className="h-48" />
          <Panel className="h-56" />
          <Panel className="h-48" />
        </aside>
      </div>
    </>
  )
}

function SupportLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <Panel className="h-64">
            <PageHeading />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {items.slice(0, 3).map((item) => (
                <Bar key={item} className="h-24 w-full" />
              ))}
            </div>
          </Panel>
          <Panel className="h-[420px]" />
          <Panel className="h-80" />
          <Panel className="space-y-4">
            <Bar className="h-6 w-56" />
            {items.slice(0, 4).map((item) => (
              <Bar key={item} className="h-24 w-full" />
            ))}
          </Panel>
        </section>
        <aside className="space-y-5">
          <Panel className="h-96" />
          <Panel className="h-[520px]" />
          <Panel className="h-80" />
        </aside>
      </div>
    </>
  )
}

function DashboardLoading() {
  return (
    <>
      <Breadcrumb />
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-5">
          <Panel className="h-72" />
          <Panel className="h-44" />
          <Panel className="h-48" />
        </aside>
        <section className="space-y-5">
          <Panel className="h-44" />
          <Panel className="space-y-4">
            <Bar className="h-6 w-48" />
            {items.slice(0, 3).map((item) => (
              <Bar key={item} className="h-28 w-full" />
            ))}
          </Panel>
          <Panel className="h-80" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="h-64" />
            <Panel className="h-64" />
          </div>
        </section>
        <aside className="space-y-5">
          <Panel className="h-72" />
          <Panel className="h-96" />
          <Panel className="h-56" />
        </aside>
      </div>
    </>
  )
}

function LoginLoading() {
  return (
    <div className="grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <Panel className="w-full max-w-md space-y-5">
        <div className="mx-auto h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <Bar className="mx-auto h-7 w-44" />
        <Bar className="mx-auto h-4 w-64 max-w-full" />
        {items.slice(0, 2).map((item) => (
          <div key={item} className="space-y-2">
            <Bar className="h-3 w-24" />
            <Bar className="h-11 w-full" />
          </div>
        ))}
        <Bar className="h-11 w-full" />
      </Panel>
    </div>
  )
}

export default function UserPageLoading({ variant = 'dashboard' }: UserPageLoadingProps) {
  return (
    <main className="min-h-full animate-pulse bg-slate-100 py-4 dark:bg-slate-950 md:py-6">
      {variant === 'profile' && <ProfileLoading />}
      {variant === 'activity' && <ActivityLoading />}
      {variant === 'notifications' && <NotificationsLoading />}
      {variant === 'settings' && <SettingsLoading />}
      {variant === 'security' && <SecurityLoading />}
      {variant === 'support' && <SupportLoading />}
      {variant === 'login' && <LoginLoading />}
      {variant === 'dashboard' && <DashboardLoading />}
    </main>
  )
}
