import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-teal-500 to-blue-600">
                <span className="text-xs font-bold text-white">IM</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">InteropMed</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              InteropMed connects healthcare data, devices, and smart hospital infrastructure through secure interoperability tools, AI guidance, and implementation support.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Hub</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/stream" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Stream</Link></li>
              <li><Link href="/workflows" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Workflows</Link></li>
              <li><Link href="/learn" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Learning Center</Link></li>
              <li><Link href="/knowledge" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Knowledge Base</Link></li>
              <li><Link href="/tools" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Tools</Link></li>
              <li><Link href="/ai-services" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">AI Services</Link></li>
              <li><Link href="/documentation" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Standards</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/solutions" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Solution Areas</Link></li>
              <li><Link href="/solutions" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Solutions</Link></li>
              <li><Link href="/smart-hospital" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Smart Hospital</Link></li>
              <li><Link href="/studio" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Studio</Link></li>
              <li><Link href="/interopmind" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">InteropMind AI</Link></li>
              <li><Link href="/technology" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Technology</Link></li>
              <li><Link href="/insights" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Insights</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Terms of Service</Link></li>
              <li><Link href="/compliance" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Compliance</Link></li>
              <li><Link href="/about" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">About</Link></li>
              <li><Link href="/contact" className="text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 md:flex-row">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Copyright {currentYear} InteropMed. All rights reserved. Connected healthcare technology.
            </p>
            <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-500">
              FHIR is a registered trademark of Health Level Seven International. InteropMed is not affiliated with or endorsed by HL7. References to FHIR indicate standards alignment and implementation support.
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
