'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

interface LeadershipProfile {
  id: string
  name: string
  role: string
  bio: string
  image_url?: string | null
  email?: string | null
}

interface AboutData {
  leadership: LeadershipProfile[]
  introVideoUrl: string
  ministryPhotos: string[]
}

export default function AboutPage() {
  const { t } = useI18n()
  const [aboutData, setAboutData] = useState<AboutData>({
    leadership: [],
    introVideoUrl: '',
    ministryPhotos: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const response = await fetch('/api/about')
        const data = await response.json()

        if (data.success) {
          setAboutData({
            leadership: data.data.leadership || [],
            introVideoUrl: data.data.introVideoUrl || '',
            ministryPhotos: data.data.ministryPhotos || [],
          })
        }
      } catch (error) {
        console.error('Failed to load about page data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  const { leadership, introVideoUrl, ministryPhotos } = aboutData
  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('about.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('about.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                RAWN Ministry
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('about.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="space-y-12">
          {/* Optional: Intro Video Section */}
          {introVideoUrl && (
            <section>
              <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.welcome')}</h2>
              <Card className="bg-slate-900/80 border border-white/10 p-0 overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src={introVideoUrl}
                    allowFullScreen
                    className="w-full h-full"
                    title="RAWN Ministry Introduction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </Card>
            </section>
          )}

          {/* Ministry Vision, Mandate & Core Values */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.vision')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('about.page.visionText')}
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.mandate')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed mb-4">
                {t('about.page.mandateText1')}
              </p>
              <p className="text-slate-300 leading-relaxed">
                {t('about.page.mandateText2')}
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.coreValues')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'prayer' },
                { key: 'prophetic' },
                { key: 'discipleship' },
                { key: 'holiness' },
                { key: 'community' },
                { key: 'missions' },
              ].map((value) => (
                <Card key={value.key} className="bg-slate-900/80 border border-white/10">
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t(`about.page.values.${value.key}.title`)}</h3>
                  <p className="text-slate-300 text-sm">{t(`about.page.values.${value.key}.desc`)}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Leadership / Founders Profiles */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.leadership')}</h2>
            {leadership.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadership.map((leader) => (
                  <Card key={leader.id} className="bg-slate-900/80 border border-white/10">
                    {leader.image_url ? (
                      <div className="mb-4 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={leader.image_url}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 rounded-lg overflow-hidden aspect-square bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                        <div className="text-4xl font-semibold text-amber-200/60">
                          {leader.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-slate-50 mb-1">{leader.name}</h3>
                    <p className="text-sm text-amber-200/90 mb-3">{leader.role}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{leader.bio}</p>
                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-block mt-3 text-sm text-amber-200/90 hover:text-amber-100 transition-colors"
                      >
                        {t('about.page.contact')}
                      </a>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/80 border border-white/10">
                <p className="text-slate-300 text-center py-8">
                  {t('about.page.leadershipComingSoon')}
                </p>
              </Card>
            )}
          </section>

          {/* Statement of Faith */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.statementOfFaith')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  {t('about.page.faith1')}
                </p>
                <p>
                  {t('about.page.faith2')}
                </p>
                <p>
                  {t('about.page.faith3')}
                </p>
                <p>
                  {t('about.page.faith4')}
                </p>
                <p>
                  {t('about.page.faith5')}
                </p>
              </div>
            </Card>
          </section>

          {/* Ministry History & Journey */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.journey')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('about.page.journeyText1')}
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                {t('about.page.journeyText2')}
              </p>
            </Card>
          </section>

          {/* Optional: Ministry Photos Gallery */}
          {ministryPhotos.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('about.page.ministryPhotos')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ministryPhotos.map((photoUrl, index) => (
                  <Card key={index} className="bg-slate-900/80 border border-white/10 p-0 overflow-hidden">
                    <div className="aspect-square">
                      <img
                        src={photoUrl}
                        alt={`Ministry photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/25 via-rose-500/15 to-indigo-500/20 border border-amber-400/40 p-8 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-50 mb-4">{t('about.page.joinTitle')}</h2>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg">
                  {t('about.page.joinText')}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/volunteer">
                    <Button variant="primary" className="bg-slate-950 text-amber-200 border border-amber-300/60 hover:bg-slate-900 rounded-full px-6 py-3">
                      {t('about.page.serveVolunteer')}
                    </Button>
                  </Link>
                  <Link href="/give">
                    <Button variant="primary" className="bg-slate-950 text-amber-200 border border-amber-300/60 hover:bg-slate-900 rounded-full px-6 py-3">
                      {t('about.page.partnerFinancially')}
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="primary" className="bg-slate-950 text-amber-200 border border-amber-300/60 hover:bg-slate-900 rounded-full px-6 py-3">
                      {t('about.page.attendEvents')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

