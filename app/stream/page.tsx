import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import StreamFeed from '@/components/StreamFeed'
import { getAccountSessionUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Professional Stream | InteropMed',
  description: 'Healthcare interoperability updates, discussions, and professional connections.',
}

export default async function StreamPage() {
  // Keep the route accessible even if the account session store is temporarily unavailable.
  let viewer = null
  try {
    viewer = await getAccountSessionUser()
  } catch (error) {
    console.error('Unable to load the Stream viewer session:', error)
  }

  const viewerId = viewer?.id || '__public_viewer__'

  // A database outage should not turn /stream into a broken link. Render the
  // public Stream shell and an empty feed until data access is restored.
  const [posts, people, topicCounts] = await Promise.all([
    prisma.userPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        content: true,
        topic: true,
        visibility: true,
        createdAt: true,
        author: { select: { id: true, publicHandle: true, displayName: true, profileImage: true, role: true } },
        likes: { where: { userId: viewerId }, select: { id: true } },
        comments: {
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
          take: 5,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, publicHandle: true, displayName: true, profileImage: true, role: true } },
          },
        },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.authUser.findMany({
      where: { isActive: true, ...(viewer ? { id: { not: viewer.id } } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        publicHandle: true,
        displayName: true,
        profileImage: true,
        _count: { select: { followers: true } },
      },
    }),
    prisma.userPost.groupBy({
      by: ['topic'],
      where: { status: 'published' },
      _count: { topic: true },
      orderBy: { _count: { topic: 'desc' } },
      take: 6,
    }),
  ]).catch((error) => {
    console.error('Unable to load InteropMed Stream data:', error)
    return [[], [], []] as const
  })

  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((comment) => ({ ...comment, createdAt: comment.createdAt.toISOString() })),
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByViewer: post.likes.length > 0,
  }))

  const displayName = viewer?.displayName || 'InteropMed member'
  const publicViewer = viewer ? {
    id: viewer.id,
    publicHandle: viewer.publicHandle,
    displayName: viewer.displayName,
    profileImage: viewer.profileImage,
    role: viewer.role,
  } : null

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#eef6f5_0,#f5f7f8_260px)] text-slate-950 dark:bg-[linear-gradient(180deg,#0b2425_0,#020617_300px)] dark:text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)_290px] xl:gap-6">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
            <div className="px-5 pb-5 pt-5 text-center">
              <ProfileAvatar imageUrl={viewer?.profileImage} name={displayName} className="mx-auto h-[72px] w-[72px] border-4 border-white text-2xl shadow-lg ring-1 ring-slate-200 dark:border-slate-900 dark:ring-slate-700" />
              <p className="mt-3 text-base font-bold">{displayName || 'InteropMed Community'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{viewer ? `@${viewer.publicHandle} | Healthcare interoperability` : 'Professional healthcare network'}</p>
              {viewer ? (
                <Link href={`/people/${encodeURIComponent(viewer.publicHandle)}`} className="mt-4 inline-flex w-full justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200">
                  View profile
                </Link>
              ) : (
                <Link href="/account/login?next=%2Fstream" className="mt-4 inline-flex w-full justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                  Join the network
                </Link>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quick access</p>
            <div className="space-y-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {[
                ['/people', 'Discover people', '01'],
                ['/insights', 'Read insights', '02'],
                ['/interopmind', 'Open InteropMind', 'AI'],
              ].map(([href, label, badge]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800">
                  <span>{label}</span>
                  <span className="text-[10px] font-bold text-slate-400">{badge}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <StreamFeed currentUser={publicViewer} initialPosts={serializedPosts} />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Network</p>
                <h2 className="mt-1 font-bold">People to follow</h2>
              </div>
              <Link href="/people" className="text-xs font-bold text-teal-700 dark:text-teal-300">View all</Link>
            </div>
            <div className="mt-5 space-y-5">
              {people.map((person) => {
                const personName = person.displayName || 'InteropMed member'
                return (
                  <div key={person.id} className="flex items-center gap-3">
                    <Link href={`/people/${encodeURIComponent(person.publicHandle)}`} className="shrink-0">
                      <ProfileAvatar imageUrl={person.profileImage} name={personName} className="h-11 w-11 text-xs shadow-sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/people/${encodeURIComponent(person.publicHandle)}`} className="block truncate text-sm font-bold hover:text-teal-700">{personName}</Link>
                      <p className="mt-0.5 truncate text-xs text-slate-400">@{person.publicHandle} | {person._count.followers} followers</p>
                    </div>
                    <Link href={`/people/${encodeURIComponent(person.publicHandle)}`} aria-label={`View ${personName}`} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700">+</Link>
                  </div>
                )
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">What people discuss</p>
            <h2 className="mt-1 font-bold">Trending topics</h2>
            <div className="mt-4 space-y-1">
              {topicCounts.map((topic, index) => (
                <div key={topic.topic} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-50 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold capitalize text-slate-700 dark:text-slate-200">#{topic.topic}</p>
                    <p className="text-[11px] text-slate-400">{topic._count.topic} posts this week</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
