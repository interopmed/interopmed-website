import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import MemberFollowButton from '@/components/MemberFollowButton'
import MemberProfileFeed from '@/components/MemberProfileFeed'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import ProfileConnections from '@/components/ProfileConnections'
import ProfileSectionTabs from '@/components/ProfileSectionTabs'
import { getAccountSessionUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Member Profile | InteropMed',
  description: 'View an InteropMed member profile and professional activity.',
}

const topicStyles: Record<string, string> = {
  api: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  fhir: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  general: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  hl7: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  implementation: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  security: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
}

const topicLabels: Record<string, string> = {
  api: 'API',
  fhir: 'FHIR',
  general: 'Community',
  hl7: 'HL7 v2',
  implementation: 'Implementation',
  security: 'Security',
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(value)
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const viewer = await getAccountSessionUser()
  const viewerId = viewer?.id || '__public_viewer__'

  const [member, suggestedMembers] = await Promise.all([
    prisma.authUser.findFirst({
      where: {
        publicHandle: username.toLowerCase(),
        isActive: true,
      },
      select: {
        id: true,
        publicHandle: true,
        displayName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        followers: {
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            follower: {
              select: {
                id: true,
                publicHandle: true,
                displayName: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        following: {
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            following: {
              select: {
                id: true,
                publicHandle: true,
                displayName: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        posts: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            content: true,
            topic: true,
            visibility: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                publicHandle: true,
                displayName: true,
                profileImage: true,
                role: true,
              },
            },
            likes: {
              where: { userId: viewerId },
              select: { id: true },
            },
            comments: {
              where: { status: 'published' },
              orderBy: { createdAt: 'asc' },
              take: 6,
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    publicHandle: true,
                    displayName: true,
                    profileImage: true,
                    role: true,
                  },
                },
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        },
        articles: {
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          take: 6,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            category: true,
            publishedAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.authUser.findMany({
      where: {
        isActive: true,
        ...(viewer ? { id: { not: viewer.id } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        publicHandle: true,
        displayName: true,
        profileImage: true,
        role: true,
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
    }),
  ])

  if (!member) {
    notFound()
  }

  const name = member.displayName || 'InteropMed member'
  const isOwnProfile = viewer?.id === member.id
  const publicViewer = viewer ? {
    id: viewer.id,
    publicHandle: viewer.publicHandle,
    displayName: viewer.displayName,
    profileImage: viewer.profileImage,
    role: viewer.role,
  } : null
  const activeTopics = Array.from(new Set(member.posts.map((post) => post.topic))).slice(0, 5)
  const serializedPosts = member.posts.map((post) => ({
    id: post.id,
    content: post.content,
    topic: post.topic,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
    })),
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    likedByViewer: post.likes.length > 0,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f5f7] text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-7 md:px-6 md:py-10">
        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_60px_rgba(15,23,42,0.08)] dark:bg-slate-900">
          <div className="relative h-48 overflow-hidden bg-slate-950 md:h-60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(45,212,191,0.5),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,116,144,0.45),transparent_30%),linear-gradient(135deg,#0f172a_0%,#134e4a_48%,#0f172a_100%)]" />
            <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full border border-white/10" />
            <span className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              InteropMed Professional
            </span>
          </div>

          <div className="px-5 pb-7 md:px-9">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative -mt-16 shrink-0 md:-mt-20">
                  <ProfileAvatar
                    imageUrl={member.profileImage}
                    name={name}
                    className="h-32 w-32 border-[6px] border-white text-5xl shadow-xl dark:border-slate-900 md:h-40 md:w-40"
                  />
                  <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 dark:border-slate-900" title="Active member" />
                </div>
                <div className="min-w-0 sm:pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="min-w-0 break-words text-3xl font-bold leading-tight tracking-tight md:text-4xl">{name}</h1>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                      Verified member
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    @{member.publicHandle} | {member.role === 'admin' ? 'Platform administrator' : 'Healthcare interoperability professional'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Member since {formatDate(member.createdAt)}
                  </p>
                </div>
              </div>

              {(isOwnProfile || viewer) && (
                <div className="flex flex-wrap gap-2 md:pt-5">
                  {isOwnProfile ? (
                  <>
                    <Link href="/user/settings" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                      Edit profile
                    </Link>
                    <Link href="/user" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200">
                      Dashboard
                    </Link>
                  </>
                  ) : viewer ? (
                  <>
                    <MemberFollowButton
                      memberId={member.id}
                      initialFollowerCount={member._count.followers}
                      initialFollowing={member.followers.some((follow) => follow.follower.id === viewer.id)}
                    />
                    <Link href="/contact" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200">
                      Message
                    </Link>
                  </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] dark:border-slate-800">
              <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {name} contributes to healthcare interoperability conversations across standards, implementation,
                secure exchange, and connected clinical workflows.
              </p>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-xl font-bold">{member._count.followers}</p>
                  <p className="text-xs font-semibold text-slate-400">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{member._count.following}</p>
                  <p className="text-xs font-semibold text-slate-400">Following</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{member.posts.length}</p>
                  <p className="text-xs font-semibold text-slate-400">Posts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProfileSectionTabs
          posts={(
            <section className="w-full">
              <MemberProfileFeed
                currentUser={publicViewer}
                initialPosts={serializedPosts}
                isOwnProfile={isOwnProfile}
              />
            </section>
          )}
          about={(
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
              <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Professional focus</p>
                <h2 className="mt-2 text-2xl font-bold">Interoperability interests</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(activeTopics.length > 0 ? activeTopics : ['fhir', 'implementation', 'security']).map((topic) => (
                    <span key={topic} className={`rounded-full px-3 py-1.5 text-xs font-bold ${topicStyles[topic] || topicStyles.general}`}>
                      {topicLabels[topic] || topic}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {name} works across standards alignment, implementation planning, secure exchange, and connected healthcare data workflows.
                </p>
              </section>
              <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:bg-slate-900 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">InteropMed member</p>
                <h2 className="mt-2 text-xl font-bold">Building connected care</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Public profiles highlight professional contributions without exposing private account or security data.
                </p>
              </section>
            </div>
          )}
          insights={(
            <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900 sm:p-7">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {member.articles.map((article) => (
                  <Link key={article.id} href={`/insights/${article.slug}`} className="group block py-5 first:pt-0 last:pb-0">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">{article.category}</span>
                    <h3 className="mt-1 text-lg font-bold transition group-hover:text-teal-700 dark:group-hover:text-teal-300">{article.title}</h3>
                    {article.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{article.excerpt}</p>}
                  </Link>
                ))}
                {member.articles.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No published insights yet.</p>}
              </div>
            </section>
          )}
          connections={(
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-6">
              <ProfileConnections
                followers={member.followers.map(({ follower }) => follower)}
                followerCount={member._count.followers}
                following={member.following.map(({ following }) => following)}
                followingCount={member._count.following}
              />
              <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">People you may know</h2>
                  <span className="text-xs font-semibold text-slate-400">{suggestedMembers.length}</span>
                </div>
                <div className="mt-4 space-y-4">
                  {suggestedMembers.filter((suggested) => suggested.id !== member.id).slice(0, 4).map((suggested) => {
                    const suggestedName = suggested.displayName || 'InteropMed member'
                    return (
                      <div key={suggested.id} className="flex items-center gap-3">
                        <Link href={`/people/${encodeURIComponent(suggested.publicHandle)}`} className="shrink-0">
                          <ProfileAvatar imageUrl={suggested.profileImage} name={suggestedName} className="h-10 w-10 text-xs" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/people/${encodeURIComponent(suggested.publicHandle)}`} className="block truncate text-sm font-bold hover:text-teal-700 dark:hover:text-teal-300">{suggestedName}</Link>
                          <p className="truncate text-xs text-slate-400">{suggested._count.followers} followers | {suggested._count.posts} posts</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        />
      </main>

      <Footer />
    </div>
  )
}
