'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { format, parseISO } from 'date-fns'
import { CardListSkeleton, Skeleton } from '@/components/ui/Skeleton'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (q: string) => {
    if (!q.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-8">Search</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sermons, blog posts, events..."
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300"
            >
              Search
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton variant="text" width="20%" height={28} />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-slate-900/80 border border-white/10 p-4">
                    <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton variant="text" width="20%" height={28} />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-slate-900/80 border border-white/10 p-4">
                    <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-8">
            {results.sermons && results.sermons.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-50 mb-4">Sermons</h2>
                <div className="space-y-3">
                  {results.sermons.map((sermon: any) => (
                    <Link key={sermon.id} href={`/sermons/${sermon.sermon_id}`}>
                      <Card className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 transition-all">
                        <h3 className="font-semibold text-slate-50">{sermon.title}</h3>
                        {sermon.category && (
                          <p className="text-sm text-slate-400 mt-1">{sermon.category}</p>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.blogPosts && results.blogPosts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-50 mb-4">Blog Posts</h2>
                <div className="space-y-3">
                  {results.blogPosts.map((post: any) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 transition-all">
                        <h3 className="font-semibold text-slate-50">{post.title}</h3>
                        {post.category && (
                          <p className="text-sm text-slate-400 mt-1">{post.category}</p>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.events && results.events.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-50 mb-4">Events</h2>
                <div className="space-y-3">
                  {results.events.map((event: any) => (
                    <Link key={event.id} href={`/events/${event.event_id}`}>
                      <Card className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 transition-all">
                        <h3 className="font-semibold text-slate-50">{event.title}</h3>
                        {event.event_date && (
                          <p className="text-sm text-slate-400 mt-1">
                            {format(parseISO(event.event_date), 'PP')}
                          </p>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(!results.sermons || results.sermons.length === 0) &&
             (!results.blogPosts || results.blogPosts.length === 0) &&
             (!results.events || results.events.length === 0) && (
              <Card className="bg-slate-900/80 border border-white/10 text-center py-12">
                <p className="text-slate-300">No results found.</p>
                <p className="text-slate-400 text-sm mt-2">Try different search terms.</p>
              </Card>
            )}
          </div>
        ) : query && (
          <Card className="bg-slate-900/80 border border-white/10 text-center py-12">
            <p className="text-slate-300">Enter a search query to begin.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton variant="text" width="30%" height={36} className="mb-8" />
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={48} className="w-full rounded-lg mb-8" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-slate-900/80 border border-white/10 p-4">
                  <Skeleton variant="text" width="60%" height={20} className="mb-2" />
                  <Skeleton variant="text" width="40%" height={16} />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}

