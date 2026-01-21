'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import { useI18n } from '@/lib/i18n/context'
import { CardListSkeleton } from '@/components/ui/Skeleton'

import { Sermon } from '@/types/sermon'

export default function SermonsPage() {
  const { t } = useI18n()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSermons() {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory) {
          params.append('category', selectedCategory)
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        const response = await fetch(`/api/sermons?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setSermons(data.data || [])
          setFilteredSermons(data.data || [])
          setError(null)
        } else {
          setError(data.error || 'Failed to load sermons')
        }
      } catch (err) {
        console.error('Failed to load sermons:', err)
        setError('Failed to load sermons. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadSermons()
    }, searchQuery ? 300 : 0)

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, searchQuery])

  const categories = Array.from(
    new Set(
      sermons
        .map((s) => s.category)
        .filter((c): c is NonNullable<typeof c> => !!c)
    )
  )

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=2070&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('sermons.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('sermons.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('home.serve.sermons')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl">
              {t('sermons.page.subtitle')}
            </p>
            <div className="mt-6">
              <Link
                href="/sermons/gallery"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200/90 hover:text-amber-100 transition-colors"
              >
                {t('sermons.page.viewGallery')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('sermons.page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          {categories.length > 0 && (
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-900/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="">{t('sermons.page.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <CardListSkeleton count={6} />
        ) : error ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
            <div className="relative z-10">
              <p className="text-slate-300 mb-4 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-semibold hover:from-amber-300 hover:to-rose-400 transition-all"
              >
                {t('sermons.page.tryAgain')}
              </button>
            </div>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-50 mb-3">{t('sermons.page.noSermons')}</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {t('sermons.page.checkBack')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSermons.map((sermon) => (
              <Link key={sermon.id} href={`/sermons/${sermon.sermon_id}`}>
                <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 h-full flex flex-col cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-rose-500/0 to-purple-500/0 group-hover:from-amber-500/5 group-hover:via-rose-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                  <div className="relative flex-1 flex flex-col p-6">
                    {sermon.category && (
                      <span className="inline-block text-xs font-bold text-amber-200/90 uppercase tracking-wide mb-3 px-3 py-1 rounded-full bg-amber-500/10 w-fit">
                        {sermon.category}
                      </span>
                    )}
                    
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-50 mb-4 line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {sermon.title}
                    </h3>

                    <div className="text-sm text-slate-300 space-y-2.5 mb-4">
                      {sermon.speaker && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span>{sermon.speaker}</span>
                        </div>
                      )}
                      {sermon.date && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span>{format(parseISO(sermon.date), 'MMMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {sermon.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {sermon.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/10">
                      {sermon.video_url && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Video
                        </span>
                      )}
                      {sermon.audio_url && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          Audio
                        </span>
                      )}
                      {sermon.notes_url && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          Notes
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

