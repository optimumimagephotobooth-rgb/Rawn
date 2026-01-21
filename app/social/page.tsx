'use client'

import { useState } from 'react'
import { SocialMediaFeed } from '@/components/social/SocialMediaFeed'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/lib/i18n/context'

export default function SocialMediaPage() {
  const { t } = useI18n()
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'Instagram' | 'Facebook'>('all')

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('social.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('social.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('nav.social').split(' ')[1] || 'Feed'}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl">
              {t('social.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedPlatform === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-amber-400/30'
            }`}
          >
            {t('social.page.allPlatforms')}
          </button>
          <button
            onClick={() => setSelectedPlatform('Instagram')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedPlatform === 'Instagram'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-slate-950 shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-purple-400/30'
            }`}
          >
            {t('social.page.instagram')}
          </button>
          <button
            onClick={() => setSelectedPlatform('Facebook')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedPlatform === 'Facebook'
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-slate-950 shadow-lg shadow-blue-500/30'
                : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-blue-400/30'
            }`}
          >
            {t('social.page.facebook')}
          </button>
        </div>

        <SocialMediaFeed platform={selectedPlatform} limit={24} />
      </div>
    </div>
  )
}
