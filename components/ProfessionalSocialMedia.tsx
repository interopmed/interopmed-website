import Link from 'next/link'

export type SocialMediaProfile = {
  platform: 'linkedin' | 'twitter' | 'github' | 'website' | 'email'
  url?: string
  handle?: string
}

type SocialMediaProps = {
  profiles?: SocialMediaProfile[]
  displayName: string
}

const socialMediaConfig = {
  linkedin: {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
    label: 'LinkedIn',
    color: 'hover:text-blue-600 dark:hover:text-blue-400',
  },
  twitter: {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9-5.5z" />
      </svg>
    ),
    label: 'Twitter/X',
    color: 'hover:text-black dark:hover:text-white',
  },
  github: {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    label: 'GitHub',
    color: 'hover:text-gray-700 dark:hover:text-gray-300',
  },
  website: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    label: 'Website',
    color: 'hover:text-teal-600 dark:hover:text-teal-400',
  },
  email: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    color: 'hover:text-orange-600 dark:hover:text-orange-400',
  },
}

export default function ProfessionalSocialMedia({ profiles = [], displayName }: SocialMediaProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Connect</p>
      <h2 className="mt-2 text-xl font-bold">Professional presence</h2>

      {profiles && profiles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {profiles.map((profile) => {
            const config = socialMediaConfig[profile.platform]
            let href = profile.url

            if (!href) {
              if (profile.platform === 'email') {
                href = `mailto:${profile.handle}`
              } else if (profile.platform === 'linkedin') {
                href = `https://linkedin.com/in/${profile.handle}`
              } else if (profile.platform === 'twitter') {
                href = `https://twitter.com/${profile.handle}`
              } else if (profile.platform === 'github') {
                href = `https://github.com/${profile.handle}`
              }
            }

            return (
              <a
                key={profile.platform}
                href={href}
                target={profile.platform !== 'email' ? '_blank' : undefined}
                rel={profile.platform !== 'email' ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 ${config.color}`}
                title={config.label}
              >
                {config.icon}
              </a>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          <p>Social media links coming soon. Update your profile to add your professional presence.</p>
        </div>
      )}

      <p className="mt-4 text-xs leading-6 text-slate-600 dark:text-slate-300">
        Connect on your preferred platforms to expand your professional network in the interoperability community.
      </p>
    </section>
  )
}
