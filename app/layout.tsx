import type { Metadata } from 'next'
import InteropMindFloatingWidget from '@/components/InteropMindFloatingWidget'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.interopmed.com'),
  title: {
    default: 'InteropMed | Health Informatics & Healthcare Interoperability',
    template: '%s | InteropMed',
  },
  description:
    'Explore health informatics, clinical information systems, healthcare interoperability, HL7 FHIR, healthcare standards and digital health implementation.',
  keywords: [
    'health informatics',
    'healthcare interoperability',
    'clinical informatics',
    'HL7 FHIR',
    'HL7 v2',
    'SNOMED CT',
    'LOINC',
    'DICOM',
    'clinical workflows',
    'EMR implementation',
    'digital health',
  ],
  authors: [{ name: 'InteropMed' }],
  creator: 'InteropMed',
  publisher: 'InteropMed',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.interopmed.com',
    siteName: 'InteropMed',
    title: 'InteropMed | Health Informatics & Healthcare Interoperability',
    description:
      'Explore health informatics, clinical information systems, healthcare interoperability, HL7 FHIR, healthcare standards and digital health implementation.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InteropMed | Health Informatics & Healthcare Interoperability',
    description:
      'Explore health informatics, clinical information systems, healthcare interoperability, HL7 FHIR, healthcare standards and digital health implementation.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <InteropMindFloatingWidget />
      </body>
    </html>
  )
}
