'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

type ProfileTab = 'activity' | 'about' | 'insights' | 'connections'

type ProfileSectionTabsProps = {
  posts: ReactNode
  about: ReactNode
  insights: ReactNode
  connections: ReactNode
}

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'activity', label: 'Posts' },
  { id: 'about', label: 'About' },
  { id: 'insights', label: 'Insights' },
  { id: 'connections', label: 'Connections' },
]

function tabFromHash(): ProfileTab {
  const hash = window.location.hash.slice(1)
  return tabs.some((tab) => tab.id === hash) ? hash as ProfileTab : 'activity'
}

export default function ProfileSectionTabs({
  posts,
  about,
  insights,
  connections,
}: ProfileSectionTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity')

  useEffect(() => {
    function syncTab() {
      setActiveTab(tabFromHash())
    }

    syncTab()
    window.addEventListener('hashchange', syncTab)
    window.addEventListener('popstate', syncTab)
    return () => {
      window.removeEventListener('hashchange', syncTab)
      window.removeEventListener('popstate', syncTab)
    }
  }, [])

  function selectTab(tab: ProfileTab) {
    setActiveTab(tab)
    window.history.pushState(null, '', `#${tab}`)
    window.scrollTo({ top: document.getElementById('profile-sections')?.offsetTop || 0, behavior: 'smooth' })
  }

  const content = {
    activity: posts,
    about,
    insights,
    connections,
  }[activeTab]

  return (
    <div id="profile-sections" className="scroll-mt-24">
      <nav
        className="mt-5 flex overflow-x-auto rounded-2xl bg-white px-2 shadow-sm dark:bg-slate-900 sm:px-3"
        aria-label="Profile sections"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            onClick={() => selectTab(tab.id)}
            aria-selected={activeTab === tab.id}
            aria-controls={`profile-panel-${tab.id}`}
            className={`shrink-0 border-b-2 px-4 py-3.5 text-sm font-bold transition sm:px-6 sm:py-4 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        key={activeTab}
        id={`profile-panel-${activeTab}`}
        role="tabpanel"
        className="mt-5 w-full scroll-mt-24 sm:mt-6"
      >
        {content}
      </div>
    </div>
  )
}
