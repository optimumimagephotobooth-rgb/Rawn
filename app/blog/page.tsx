'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { format, parseISO } from 'date-fns'
import { useI18n } from '@/lib/i18n/context'
import { CardListSkeleton, PageSkeleton } from '@/components/ui/Skeleton'

interface BlogPost {
  id: string
  post_id: string
  title: string
  slug: string
  excerpt: string | null
  author: string | null
  category: string | null
  featured_image: string | null
  published_at: string | null
  tags: string[] | null
}

function BlogPageContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.append('status', 'Published')
        params.append('page', page.toString())
        params.append('limit', '9')
        if (selectedCategory) {
          params.append('category', selectedCategory)
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        // Update URL without navigation
        const newUrl = `/blog?${params.toString()}`
        window.history.replaceState({}, '', newUrl)

        const response = await fetch(`/api/blog?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setPosts(data.data || [])
          setFilteredPosts(data.data || [])
          setTotalPages(data.pagination?.totalPages || 1)
        }
      } catch (err) {
        console.error('Failed to load posts:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadPosts()
    }, searchQuery ? 300 : 0)

    return () => clearTimeout(timeoutId)
  }, [page, selectedCategory, searchQuery])

  const categories = ['Prophetic', 'Devotional', 'Teaching', 'Announcement']

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchQuery('')
    setPage(1)
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('blog.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('blog.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('blog.page.titlePart2')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl">
              {t('blog.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('blog.page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-w-[160px]"
          >
            <option value="">{t('blog.page.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {(selectedCategory || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">{t('blog.page.activeFilters')}</span>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200/90 text-xs hover:bg-amber-400/30 transition-colors flex items-center gap-1"
              >
                {selectedCategory}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200/90 text-xs hover:bg-amber-400/30 transition-colors flex items-center gap-1"
              >
                {t('blog.page.search')} {searchQuery}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-amber-300/80 hover:text-amber-200 underline"
            >
              {t('blog.page.clearAll')}
            </button>
          </div>
        )}

        {isLoading ? (
          <CardListSkeleton count={9} />
        ) : filteredPosts.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-50 mb-3">{t('blog.page.noPostsFound')}</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">{t('blog.page.tryAdjusting')}</p>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-semibold hover:from-amber-300 hover:to-rose-400 transition-all"
                >
                  {t('blog.page.clearFilters')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 h-full flex flex-col cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-rose-500/0 to-purple-500/0 group-hover:from-amber-500/5 group-hover:via-rose-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                    {post.featured_image && (
                      <div className="relative -mx-6 -mt-6 mb-6 h-56 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="relative flex-1 flex flex-col p-6">
                      {post.category && (
                        <Link
                          href={`/blog?category=${encodeURIComponent(post.category)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block text-xs font-bold text-amber-200/90 uppercase tracking-wide mb-3 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors w-fit"
                        >
                          {post.category}
                        </Link>
                      )}
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-50 mb-3 line-clamp-2 group-hover:text-amber-200 transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag}
                              href={`/blog?search=${encodeURIComponent(tag)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-200/80 text-xs hover:bg-amber-400/20 transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-slate-500">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 mt-auto pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {post.author}
                          </span>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(parseISO(post.published_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/80 transition-colors text-sm sm:text-base"
                >
                  {t('blog.page.previous')}
                </button>
                <span className="px-4 py-2 text-slate-300 text-sm sm:text-base">
                  {t('blog.page.page')} {page} {t('blog.page.of')} {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/80 transition-colors text-sm sm:text-base"
                >
                  {t('blog.page.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <PageSkeleton />
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}

