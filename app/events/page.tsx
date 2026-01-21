'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EventCalendar } from '@/components/events/EventCalendar'
import { format, parseISO, isPast, isFuture } from 'date-fns'
import { useI18n } from '@/lib/i18n/context'
import { CardListSkeleton } from '@/components/ui/Skeleton'

interface Event {
  id: string
  event_id: string
  title: string
  description: string | null
  category: string | null
  event_date: string
  event_time: string | null
  end_date: string | null
  end_time: string | null
  location: string | null
  zoom_url: string | null
  is_online: boolean
  registration_required: boolean
  price: number
  currency: string
  capacity: number | null
  status: string
  featured_image: string | null
}

export default function EventsPage() {
  const { t } = useI18n()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const params = new URLSearchParams()
        params.append('status', 'Published')
        if (filter === 'upcoming') {
          params.append('upcoming', 'true')
        } else if (filter === 'past') {
          params.append('past', 'true')
        }

        const response = await fetch(`/api/events?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setEvents(data.data || [])
          setFilteredEvents(data.data || [])
        }
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [filter])

  useEffect(() => {
    let filtered = events

    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory)
    }

    setFilteredEvents(filtered)
  }, [selectedCategory, events])

  const categories = Array.from(
    new Set(
      events
        .map((e) => e.category)
        .filter((c): c is string => !!c)
    )
  )

  const formatEventDate = (event: Event) => {
    const date = parseISO(event.event_date)
    let dateStr = format(date, 'MMMM d, yyyy')
    
    if (event.event_time) {
      const time = event.event_time.substring(0, 5) // HH:mm
      dateStr += ` at ${time}`
    }

    if (event.end_date && event.end_date !== event.event_date) {
      const endDate = parseISO(event.end_date)
      dateStr += ` - ${format(endDate, 'MMMM d, yyyy')}`
      if (event.end_time) {
        dateStr += ` at ${event.end_time.substring(0, 5)}`
      }
    }

    return dateStr
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section with Background Image */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('events.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('events.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('home.serve.gatherings')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl">
              {t('events.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Filters Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-amber-400/30'
                }`}
              >
                {t('events.page.allEvents')}
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === 'upcoming'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-amber-400/30'
                }`}
              >
                {t('events.page.upcoming')}
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === 'past'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800/60 border border-white/10 text-slate-300 hover:bg-slate-800/80 hover:border-amber-400/30'
                }`}
              >
                {t('events.page.past')}
              </button>
            </div>

            {/* View Mode & Category Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2 bg-slate-800/60 border border-white/10 rounded-full p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950'
                      : 'text-slate-300 hover:text-slate-50'
                  }`}
                >
                  {t('events.page.listView')}
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950'
                      : 'text-slate-300 hover:text-slate-50'
                  }`}
                >
                  {t('events.page.calendarView')}
                </button>
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-full border border-white/10 bg-slate-800/60 text-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                >
                  <option value="">{t('sermons.page.allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Events Content */}
        {isLoading ? (
          <CardListSkeleton count={6} />
        ) : filteredEvents.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-50 mb-3">{t('events.page.noEvents')}</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                {t('events.page.checkBack')}
              </p>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 lg:p-8">
            <EventCalendar events={filteredEvents} />
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const eventDate = parseISO(event.event_date)
              const isEventPast = isPast(eventDate)

              return (
                <Card
                  key={event.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-rose-500/0 to-purple-500/0 group-hover:from-amber-500/5 group-hover:via-rose-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                  
                  {/* Event Image */}
                  <div className="relative -mx-6 -mt-6 mb-6 h-56 overflow-hidden">
                    {event.featured_image ? (
                      <img
                        src={event.featured_image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-600/20 via-rose-600/20 to-purple-600/20 flex items-center justify-center">
                        <div className="text-center p-6">
                          <svg className="w-16 h-16 text-amber-400/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-slate-400 font-medium">{t('events.page.eventImage')}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-rose-400 shadow-lg">
                          {event.category}
                        </span>
                      </div>
                    )}

                    {/* Online Badge */}
                    {event.is_online && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-50 bg-slate-900/90 backdrop-blur-sm border border-white/20">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          {t('events.page.online')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative space-y-4">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-50 line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-slate-300 leading-relaxed">{formatEventDate(event)}</span>
                      </div>
                      
                      {event.location && !event.is_online && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-300 leading-relaxed">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          {event.price > 0 ? (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-300">
                          {event.price > 0 ? (
                            <span>{event.currency} {event.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-green-400">{t('events.page.freeEvent')}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link href={`/events/${event.event_id}`} className="block">
                        <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 text-slate-950 font-bold text-sm hover:from-amber-300 hover:via-rose-400 hover:to-purple-400 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5">
                          {isEventPast ? t('events.page.viewDetails') : event.registration_required ? t('events.page.registerNow') : t('events.page.learnMore')}
                        </button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

