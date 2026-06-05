import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

type AccountBreadcrumbProps = {
  items: BreadcrumbItem[]
}

export default function AccountBreadcrumb({ items }: AccountBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
        <li>
          <Link href="/account" className="font-semibold text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">
            Account
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.href || item.label}-${item.label}`} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link href={item.href} className="font-semibold text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-950 dark:text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
