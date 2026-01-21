'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Carousel } from '@/components/ui/Carousel'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { useI18n } from '@/lib/i18n/context'

interface Sermon {
  id: string
  sermon_id: string
  title: string
  speaker: string | null
  category: string | null
  description: string | null
  date: string | null
  video_url: string | null
  audio_url: string | null
}

interface Event {
  id: string
  event_id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  is_online: boolean
  registration_required: boolean
  price: number
  currency: string
}

interface BlogPost {
  id: string
  post_id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  published_at: string | null
}

export default function Home() {
  const { t } = useI18n()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<BlogPost[]>([])
  const [testimonies, setTestimonies] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch latest sermons
        const sermonsRes = await fetch('/api/sermons')
        const sermonsData = await sermonsRes.json()
        if (sermonsData.success) {
          setSermons(sermonsData.data?.slice(0, 6) || [])
        }

        // Fetch upcoming events
        const eventsRes = await fetch('/api/events?upcoming=true&status=Published')
        const eventsData = await eventsRes.json()
        if (eventsData.success) {
          setEvents(eventsData.data?.slice(0, 3) || [])
        }

        // Fetch announcements
        const announcementsRes = await fetch('/api/blog?category=Announcement&status=Published&limit=5')
        const announcementsData = await announcementsRes.json()
        if (announcementsData.success) {
          setAnnouncements(announcementsData.data || [])
        }

        // Fetch testimonies (using blog posts with "testimony" or "impact" tags)
        const testimoniesRes = await fetch('/api/blog?status=Published&limit=10')
        const testimoniesData = await testimoniesRes.json()
        if (testimoniesData.success) {
          // Filter for testimonies - can be enhanced with tags in the future
          const filtered = testimoniesData.data?.filter(
            (post: BlogPost) =>
              post.category === 'Devotional' ||
              (post.title?.toLowerCase().includes('testimony') ||
                post.title?.toLowerCase().includes('impact') ||
                post.title?.toLowerCase().includes('story'))
          ) || []
          setTestimonies(filtered.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=2070&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
                {t('home.hero.tagline')}
              </p>
              <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50 text-balance">
                {t('home.hero.title')}&nbsp;
                <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-300 bg-clip-text text-transparent">
                  Jesus Christ
                </span>
              </h1>
              <p className="mt-5 text-sm sm:text-base text-slate-300/90 max-w-xl leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#join">
                  <Button className="bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-slate-950 font-semibold px-6 py-2 rounded-full shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    {t('home.hero.joinMovement')}
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="secondary" className="rounded-full text-sm px-5 py-2 border border-white/10 bg-slate-900/60 hover:bg-slate-800/80">
                    {t('home.hero.upcomingEvents')}
                  </Button>
                </Link>
                <Link href="/give" className="text-xs font-semibold text-amber-200/90 hover:text-amber-100 underline underline-offset-4">
                  {t('home.hero.partnerWithRawn')}
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-4 text-xs text-slate-300/80">
                <div>
                  <div className="font-semibold text-slate-100">{t('home.hero.vision')}</div>
                  <p className="mt-1 leading-relaxed">
                    {t('home.hero.visionText')}
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{t('home.hero.mandate')}</div>
                  <p className="mt-1 leading-relaxed">
                    {t('home.hero.mandateText')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500/40 via-rose-500/40 to-indigo-500/40 blur-3xl opacity-70" />
              <Card className="relative bg-slate-900/80 border border-white/10 shadow-2xl shadow-slate-900/70">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/80 mb-3">
                  {t('home.scripture.title')}
                </p>
                <p className="text-sm text-slate-100 leading-relaxed italic">
                  &ldquo;{t('home.scripture.verse')}&rdquo;
                </p>
                <p className="mt-3 text-xs font-semibold text-amber-200/90">{t('home.scripture.reference')}</p>
                <div className="mt-6 grid gap-3 text-xs text-slate-200">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-amber-500/20 text-amber-200 flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <div>
                      <div className="font-semibold">{t('home.scripture.hubs')}</div>
                      <p className="text-slate-300 mt-0.5">
                        {t('home.scripture.hubsText')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-rose-500/20 text-rose-100 flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <div>
                      <div className="font-semibold">{t('home.scripture.teaching')}</div>
                      <p className="text-slate-300 mt-0.5">
                        {t('home.scripture.teachingText')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-100 flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <div>
                      <div className="font-semibold">{t('home.scripture.global')}</div>
                      <p className="text-slate-300 mt-0.5">
                        {t('home.scripture.globalText')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured content carousel */}
      <section className="relative border-t border-white/10 bg-slate-950/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-16">
          {/* Featured Content Carousel */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
                  {t('home.featured.title')}
                </h2>
                <p className="text-sm text-slate-300/90 mt-2 max-w-xl">
                  {t('home.featured.subtitle')}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="bg-slate-900/70 border border-white/5 animate-pulse"
                  >
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <Carousel autoPlay={true} interval={6000} showIndicators={true} showArrows={true} className="w-full">
                {/* Latest Sermons Slide */}
                <div className="w-full">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-50">{t('home.featured.latestSermons')}</h3>
                    <Link
                      href="/sermons"
                      className="text-xs font-semibold text-amber-200/90 hover:text-amber-100 whitespace-nowrap"
                    >
                      {t('home.featured.viewAll')}
                    </Link>
                  </div>
                  {sermons.length > 0 ? (
                    <div className={`grid gap-4 w-full ${sermons.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : sermons.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {sermons.slice(0, 3).map((sermon) => (
                        <Link key={sermon.id} href={`/sermons/${sermon.sermon_id}`} className="block w-full">
                          <Card className="bg-slate-900/70 border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all cursor-pointer h-full w-full">
                            {sermon.category && (
                              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200/80 mb-2">
                                {sermon.category}
                              </div>
                            )}
                            <h4 className="text-sm font-semibold text-slate-50 mb-2 line-clamp-2">
                              {sermon.title}
                            </h4>
                            {sermon.speaker && (
                              <p className="text-[11px] text-slate-400 mb-2">by {sermon.speaker}</p>
                            )}
                            {sermon.description && (
                              <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                                {sermon.description}
                              </p>
                            )}
                            {sermon.date && (
                              <p className="text-[10px] text-slate-500">
                                {new Date(sermon.date).toLocaleDateString()}
                              </p>
                            )}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-3 w-full">
                      {['Prophetic', 'Prayer', 'Discipleship'].map((label) => (
                        <Card
                          key={label}
                          className="bg-slate-900/70 border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all cursor-pointer w-full"
                        >
                          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200/80 mb-2">
                            {label}
                          </div>
                          <p className="text-sm text-slate-50 mb-2 line-clamp-2">
                            A timely word for intercessors and disciples in this season.
                          </p>
                          <p className="text-[11px] text-slate-400">Watch or listen via RAWN Sermons.</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Events Slide */}
                <div className="w-full">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-50">{t('home.featured.upcomingEvents')}</h3>
                    <Link
                      href="/events"
                      className="text-xs font-semibold text-amber-200/90 hover:text-amber-100 whitespace-nowrap"
                    >
                      {t('home.featured.viewCalendar')}
                    </Link>
                  </div>
                  {events.length > 0 ? (
                    <div className={`grid gap-4 w-full ${events.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : events.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {events.map((event) => (
                        <Link key={event.id} href={`/events/${event.event_id}`} className="block w-full">
                          <Card className="bg-slate-900/70 border border-white/10 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all cursor-pointer h-full w-full">
                            <div className="space-y-3 text-xs text-slate-200">
                              <div>
                                <h4 className="font-semibold text-slate-50 mb-1 line-clamp-2">{event.title}</h4>
                                {event.description && (
                                  <p className="text-slate-300 line-clamp-2 mt-1">{event.description}</p>
                                )}
                              </div>
                              <div className="flex items-start justify-between gap-2 pt-2 border-t border-white/10">
                                <div className="flex flex-col text-[11px] text-slate-300 gap-1">
                                  <span>
                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  {event.event_time && <span>{event.event_time}</span>}
                                  {event.location && !event.is_online && (
                                    <span className="line-clamp-1 text-[10px]">{event.location}</span>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="rounded-full bg-amber-400/10 text-amber-100 px-3 py-1 text-[10px] font-semibold whitespace-nowrap">
                                    {event.is_online ? 'Online' : 'In-Person'} •{' '}
                                    {event.price === 0 ? 'Free' : `${event.currency} ${event.price}`}
                                  </div>
                                </div>
                              </div>
                              {event.registration_required && (
                                <div className="pt-2">
                                  <Button className="w-full rounded-full text-xs px-4 py-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300">
                                    Register / RSVP
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto w-full">
                      <Card className="bg-slate-900/70 border border-white/10 w-full">
                        <div className="space-y-4 text-xs text-slate-200">
                          <div className="flex justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-50">
                                Prophetic Prayer Watch (Online)
                              </div>
                              <p className="text-slate-300 mt-1">
                                Join intercessors across nations as we pray prophetically over families and
                                territories.
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="rounded-full bg-amber-400/10 text-amber-100 px-3 py-1 text-[10px] font-semibold whitespace-nowrap">
                                Zoom • Free
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                            <div className="flex flex-col text-[11px] text-slate-300">
                              <span>Date: To be announced</span>
                              <span>Time: Regional time zones</span>
                            </div>
                            <Link href="/events">
                              <Button className="rounded-full text-xs px-4 py-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300">
                                Register / RSVP
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Major Announcements Slide */}
                {announcements.length > 0 && (
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-slate-50">{t('home.featured.majorAnnouncements')}</h3>
                      <Link
                        href="/blog"
                        className="text-xs font-semibold text-amber-200/90 hover:text-amber-100 whitespace-nowrap"
                      >
                        {t('home.featured.viewAll')}
                      </Link>
                    </div>
                    <div className={`grid gap-4 w-full ${announcements.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : announcements.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {announcements.slice(0, 3).map((announcement) => (
                        <Link key={announcement.id} href={`/blog/${announcement.slug}`} className="block w-full">
                          <Card className="bg-slate-900/70 border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all cursor-pointer h-full w-full">
                            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200/80 mb-2">
                              Announcement
                            </div>
                            <h4 className="text-sm font-semibold text-slate-50 mb-2 line-clamp-2">
                              {announcement.title}
                            </h4>
                            {announcement.excerpt && (
                              <p className="text-xs text-slate-300 line-clamp-3">{announcement.excerpt}</p>
                            )}
                            {announcement.published_at && (
                              <p className="text-[10px] text-slate-500 mt-2">
                                {new Date(announcement.published_at).toLocaleDateString()}
                              </p>
                            )}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Carousel>
            )}
          </div>

          {/* Call to action / Join section */}
          <section
            id="join"
            className="relative rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/25 via-rose-500/15 to-indigo-500/20 px-6 py-10 sm:px-10 sm:py-12 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_#ffffff33,_transparent_60%),radial-gradient(circle_at_bottom,_#00000055,_transparent_60%)]" />
            <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-50/90">
                  {t('home.join.tagline')}
                </p>
                <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-50 max-w-lg">
                  {t('home.join.title')}
                </h2>
                <p className="mt-3 text-sm text-amber-50/90 max-w-xl">
                  {t('home.join.subtitle')}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/give">
                    <Button className="rounded-full text-xs sm:text-sm px-5 py-2 bg-slate-950 text-amber-200 border border-amber-300/60 hover:bg-slate-900">
                      {t('home.join.partnerGive')}
                    </Button>
                  </Link>
                  <Link href="/volunteer">
                    <Button variant="secondary" className="rounded-full text-xs sm:text-sm px-5 py-2 bg-transparent border border-amber-200/60 text-slate-50 hover:bg-slate-900/60">
                      {t('home.join.serveVolunteer')}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <Card className="bg-slate-950/70 border border-amber-200/40 shadow-lg shadow-slate-950/60">
                  <p className="text-xs font-semibold text-amber-100 mb-2">
                    {t('home.join.stayConnected')}
                  </p>
                  <p className="text-[11px] text-amber-50/90 mb-4">
                    {t('home.join.emailDescription')}
                  </p>
                  <NewsletterForm source="homepage" className="space-y-3" />
                  <p className="text-[10px] text-amber-50/70 mt-3">
                    {t('home.join.privacy')}
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonies & Impact Stories */}
          {testimonies.length > 0 && (
            <section className="relative border-t border-white/10 pt-16">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
                    Testimonies & Impact Stories
                  </h2>
                  <p className="text-sm text-slate-300/90 mt-2 max-w-xl">
                    Stories of transformation, breakthrough, and God's faithfulness in the RAWN community
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="text-xs font-semibold text-amber-200/90 hover:text-amber-100"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {testimonies.map((testimony) => (
                  <Link key={testimony.id} href={`/blog/${testimony.slug}`}>
                    <Card className="bg-slate-900/70 border border-white/5 hover:border-amber-400/60 hover:-translate-y-0.5 transition-all cursor-pointer h-full">
                      <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200/80 mb-2">
                        Testimony
                      </div>
                      <h4 className="text-sm font-semibold text-slate-50 mb-2 line-clamp-2">
                        {testimony.title}
                      </h4>
                      {testimony.excerpt && (
                        <p className="text-xs text-slate-300 line-clamp-3">{testimony.excerpt}</p>
                      )}
                      {testimony.published_at && (
                        <p className="text-[10px] text-slate-500 mt-2">
                          {new Date(testimony.published_at).toLocaleDateString()}
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {/* About & mandate section */}
      <section className="relative border-t border-white/10 bg-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-12">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-200/90">
                {t('about.page.tagline')}
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-50">
                {t('about.page.subtitle')}
              </h2>
              <p className="mt-4 text-sm text-slate-300/90 leading-relaxed">
                {t('about.page.journeyText1')}
              </p>
              <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
                {t('about.page.journeyText2')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <Card className="bg-slate-900/80 border border-white/10">
                <h3 className="text-sm font-semibold text-slate-50">{t('home.about.vision')}</h3>
                <p className="mt-2 text-slate-300/90">
                  {t('home.about.visionText')}
                </p>
              </Card>
              <Card className="bg-slate-900/80 border border-white/10">
                <h3 className="text-sm font-semibold text-slate-50">{t('home.about.mandate')}</h3>
                <p className="mt-2 text-slate-300/90">
                  {t('home.about.mandateText')}
                </p>
              </Card>
              <Card className="bg-slate-900/80 border border-white/10">
                <h3 className="text-sm font-semibold text-slate-50">{t('home.about.rhythm')}</h3>
                <p className="mt-2 text-slate-300/90">
                  {t('home.about.rhythmText')}
                </p>
              </Card>
              <Card className="bg-slate-900/80 border border-white/10">
                <h3 className="text-sm font-semibold text-slate-50">{t('home.about.language')}</h3>
                <p className="mt-2 text-slate-300/90">
                  {t('home.about.languageText')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How we serve section */}
      <section className="relative border-t border-white/10 bg-slate-950/95">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-200/90">
                {t('home.serve.tagline')}
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-50">
                {t('home.serve.title')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300/90 max-w-md">
              {t('home.serve.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <Card className="glass-card-primary flex flex-col">
              <h3 className="text-sm font-semibold text-slate-50">{t('home.serve.sermons')}</h3>
              <p className="mt-2 text-slate-300/90 flex-1">
                {t('home.serve.sermonsText')}
              </p>
              <Link
                href="/sermons"
                className="mt-3 text-[11px] font-semibold text-amber-200/90 hover:text-amber-100"
              >
                {t('home.serve.exploreSermons')}
              </Link>
            </Card>
            <Card className="glass-card-primary flex flex-col">
              <h3 className="text-sm font-semibold text-slate-50">{t('home.serve.prayer')}</h3>
              <p className="mt-2 text-slate-300/90 flex-1">
                {t('home.serve.prayerText')}
              </p>
              <Link
                href="/prayer-request"
                className="mt-3 text-[11px] font-semibold text-amber-200/90 hover:text-amber-100"
              >
                {t('home.serve.requestPrayer')}
              </Link>
            </Card>
            <Card className="glass-card-primary flex flex-col">
              <h3 className="text-sm font-semibold text-slate-50">{t('home.serve.gatherings')}</h3>
              <p className="mt-2 text-slate-300/90 flex-1">
                {t('home.serve.gatheringsText')}
              </p>
              <Link
                href="/events"
                className="mt-3 text-[11px] font-semibold text-amber-200/90 hover:text-amber-100"
              >
                {t('home.serve.viewGatherings')}
              </Link>
            </Card>
            <Card className="glass-card-primary flex flex-col">
              <h3 className="text-sm font-semibold text-slate-50">{t('home.serve.training')}</h3>
              <p className="mt-2 text-slate-300/90 flex-1">
                {t('home.serve.trainingText')}
              </p>
              <Link
                href="/onboarding"
                className="mt-3 text-[11px] font-semibold text-amber-200/90 hover:text-amber-100"
              >
                {t('home.serve.startJourney')}
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Who we equip / FAQ section */}
      <section className="relative border-t border-white/10 bg-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-200/90">
                Who We Equip
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-50">
                RAWN is for intercessors, pastors, creatives, families, and emerging leaders.
              </h2>
              <p className="mt-4 text-sm text-slate-300/90 leading-relaxed">
                You may find yourself in one or more of these lanes. Wherever you are, we want to help you
                discover language for your calling, strength for the journey, and a tribe that runs with you.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
                <Card className="glass-card-secondary">
                  <h3 className="text-sm font-semibold text-slate-50">Intercessors & Watchmen</h3>
                  <p className="mt-2 text-slate-300/90">
                    For those who carry a burden for prayer, nations, and the purposes of God in the earth.
                  </p>
                </Card>
                <Card className="glass-card-secondary">
                  <h3 className="text-sm font-semibold text-slate-50">Pastors & Leaders</h3>
                  <p className="mt-2 text-slate-300/90">
                    For shepherds, church planters, and ministry teams cultivating healthy prophetic culture.
                  </p>
                </Card>
                <Card className="glass-card-secondary">
                  <h3 className="text-sm font-semibold text-slate-50">Families & Young Adults</h3>
                  <p className="mt-2 text-slate-300/90">
                    For parents, students, and young professionals contending for revival in everyday life.
                  </p>
                </Card>
                <Card className="glass-card-secondary">
                  <h3 className="text-sm font-semibold text-slate-50">Creatives & Builders</h3>
                  <p className="mt-2 text-slate-300/90">
                    For those called to media, business, and creative expression who carry a prophetic edge.
                  </p>
                </Card>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-200/90">
                Quick Questions
              </p>
              <Card className="glass-card-faq">
                <h3 className="text-sm font-semibold text-slate-50">
                  Do I have to be part of a specific church to join?
                </h3>
                <p className="mt-2 text-slate-300/90">
                  No. RAWN serves the wider body of Christ. We honor and work alongside local churches and
                  leaders across denominations and nations.
                </p>
              </Card>
              <Card className="glass-card-faq">
                <h3 className="text-sm font-semibold text-slate-50">
                  How can I stay updated on what&apos;s happening?
                </h3>
                <p className="mt-2 text-slate-300/90">
                  Subscribe to email updates, follow our online channels, and regularly check the events and
                  sermons pages for new content and gatherings.
                </p>
              </Card>
              <Card className="glass-card-faq">
                <h3 className="text-sm font-semibold text-slate-50">Is there a way to give or partner?</h3>
                <p className="mt-2 text-slate-300/90">
                  Yes. You can partner financially, volunteer, or help plant hubs in your region. Visit the
                  give page or contact our team for more information.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

