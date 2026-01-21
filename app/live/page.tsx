'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/lib/i18n/context'

export default function LivePage() {
  const { t } = useI18n()
  const [youtubeChannelId, setYoutubeChannelId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch YouTube channel ID from API
    async function loadChannelId() {
      try {
        const response = await fetch('/api/settings/youtube-channel')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.channelId) {
            setYoutubeChannelId(data.channelId)
          }
        }
      } catch (err) {
        console.error('Failed to load YouTube channel ID:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadChannelId()
  }, [])

  const embedUrl = youtubeChannelId
    ? `https://www.youtube.com/embed/live_stream?channel=${youtubeChannelId}`
    : null

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('live.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('live.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('live.page.titlePart2')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('live.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 rounded-2xl shadow-xl p-6 lg:p-8">
          {isLoading ? (
            <div className="w-full aspect-video flex items-center justify-center">
              <div className="text-slate-400">{t('live.page.loading')}</div>
            </div>
          ) : embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                allowFullScreen
                className="w-full aspect-video rounded-lg"
                title="Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
              <p className="text-slate-300 text-sm text-center mt-4">
                {t('live.page.refreshMessage')}
              </p>
            </>
          ) : (
            <div className="w-full aspect-video flex flex-col items-center justify-center text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-50 mb-3">{t('live.page.notConfigured')}</h2>
              <p className="text-slate-300 mb-4 max-w-md">
                {t('live.page.configureMessage')}
              </p>
              <p className="text-slate-400 text-sm">
                {t('live.page.configureInstructions')} <code className="bg-slate-800 px-2 py-1 rounded">NEXT_PUBLIC_YOUTUBE_CHANNEL_ID</code> {t('live.page.configureInstructions2')}
              </p>
            </div>
          )}
          </Card>
        </div>
      </main>
    </div>
  )
}

