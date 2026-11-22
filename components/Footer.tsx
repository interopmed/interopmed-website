import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600">
                <span className="text-xs font-bold text-white">IM</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">InteropMed</span>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Health informatics and healthcare interoperability knowledge platform. Understanding healthcare systems, connecting healthcare data, and improving clinical workflows.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Knowledge Hub</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/articles" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Articles</Link></li>
              <li><Link href="/clinical-informatics" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Clinical Informatics</Link></li>
              <li><Link href="/interoperability" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Interoperability</Link></li>
              <li><Link href="/implementation" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Implementation</Link></li>
              <li><Link href="/resources" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Resources & Standards</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Interactive & Community</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/interopmind" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">InteropMind</Link></li>
              <li><Link href="/community" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Community</Link></li>
              <li><Link href="/stream" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Stream Activity</Link></li>
              <li><Link href="/learn" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Learning Center</Link></li>
              <li><Link href="/knowledge" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Standards Reference</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">About InteropMed</Link></li>
              <li><Link href="/contact" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Contact</Link></li>
              <li><Link href="/privacy" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Terms of Use</Link></li>
              <li><Link href="/compliance" className="text-slate-600 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 md:flex-row">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} InteropMed. Health Informatics & Healthcare Interoperability Knowledge Platform.
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-500">
              FHIR® is a registered trademark of Health Level Seven International. InteropMed is an independent health informatics educational resource dedicated to advancing digital health standards and clinical workflow understanding.
            </p>
          </div>
          <div className="mt-4 flex gap-6 md:mt-0">
            <Link href="/account" className="text-sm text-slate-500 transition hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">
              Account
            </Link>
            <Link href="/contact" className="text-sm text-slate-500 transition hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
