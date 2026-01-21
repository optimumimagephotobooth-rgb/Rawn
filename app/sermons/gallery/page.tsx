'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { format, parseISO } from 'date-fns'
import { Sermon } from '@/types/sermon'
import { VideoEmbed } from '@/components/sermons/VideoEmbed'
import { useI18n } from '@/lib/i18n/context'
import { CardListSkeleton } from '@/components/ui/Skeleton'

export default function SermonGalleryPage() {
  const { t } = useI18n()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)

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
          // Filter to only show sermons with video URLs
          const videoSermons = (data.data || []).filter(
            (s: Sermon) => s.video_url && s.video_url.includes('youtube.com')
          )
          setSermons(videoSermons)
          setFilteredSermons(videoSermons)
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

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
    return null
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-4">
            {t('sermons.gallery.title')}
          </h1>
          <p className="text-slate-300/90">
            {t('sermons.gallery.subtitle')}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('sermons.gallery.searchPlaceholder')}
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
                <option value="">{t('sermons.gallery.allCategories')}</option>
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
          <Card className="bg-slate-900/80 border border-white/10 text-center py-12">
            <p className="text-slate-300 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-amber-200/90 hover:text-amber-100 text-sm underline"
            >
              {t('sermons.gallery.tryAgain')}
            </button>
          </Card>
        ) : filteredSermons.length === 0 ? (
          <Card className="bg-slate-900/80 border border-white/10 text-center py-12">
            <p className="text-slate-300">{t('sermons.gallery.noSermons')}</p>
            <p className="text-slate-400 text-sm mt-2">{t('sermons.gallery.checkBack')}</p>
          </Card>
        ) : (
          <>
            {selectedSermon ? (
              <div className="mb-8">
                <button
                  onClick={() => setSelectedSermon(null)}
                  className="mb-4 inline-flex items-center gap-2 text-amber-200/90 hover:text-amber-100 text-sm"
                >
                  {t('sermons.gallery.backToGallery')}
                </button>
                <Card className="bg-slate-900/80 border border-white/10">
                  <h2 className="text-2xl font-semibold text-slate-50 mb-4">{selectedSermon.title}</h2>
                  {selectedSermon.video_url && (
                    <VideoEmbed url={selectedSermon.video_url} title={selectedSermon.title} />
                  )}
                  {selectedSermon.description && (
                    <div className="mt-4 text-slate-300">{selectedSermon.description}</div>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                    {selectedSermon.speaker && <span>{t('sermons.gallery.by')} {selectedSermon.speaker}</span>}
                    {selectedSermon.date && (
                      <span>{format(parseISO(selectedSermon.date), 'MMMM d, yyyy')}</span>
                    )}
                  </div>
                  <Link
                    href={`/sermons/${selectedSermon.sermon_id}`}
                    className="mt-4 inline-block text-amber-200/90 hover:text-amber-100 text-sm"
                  >
                    {t('sermons.gallery.viewFullDetails')}
                  </Link>
                </Card>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSermons.map((sermon) => {
                  const thumbnail = sermon.video_url ? getYouTubeThumbnail(sermon.video_url) : null
                  
                  return (
                    <Card
                      key={sermon.id}
                      className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 transition-all cursor-pointer overflow-hidden"
                      onClick={() => setSelectedSermon(sermon)}
                    >
                      {thumbnail ? (
                        <div className="relative w-full aspect-video overflow-hidden bg-slate-800">
                          <img
                            src={thumbnail}
                            alt={sermon.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-600 transition-colors">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
                          <div className="text-4xl">🎥</div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {sermon.category && (
                          <span className="inline-block text-xs font-semibold text-amber-200/90 uppercase tracking-wide mb-2">
                            {sermon.category}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-slate-50 mb-2 line-clamp-2">
                          {sermon.title}
                        </h3>
                        <div className="text-sm text-slate-400 space-y-1">
                          {sermon.speaker && <div>{t('sermons.gallery.by')} {sermon.speaker}</div>}
                          {sermon.date && (
                            <div>{format(parseISO(sermon.date), 'MMM d, yyyy')}</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
