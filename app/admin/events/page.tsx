'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { AdminLayout } from '@/components/AdminLayout'
import { FormPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    eventDate: '',
    eventTime: '',
    endDate: '',
    endTime: '',
    location: '',
    zoomUrl: '',
    isOnline: false,
    registrationRequired: false,
    price: '0',
    currency: 'USD',
    capacity: '',
    status: 'Draft',
    featuredImage: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userDataRaw } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student' } | null

      if (!userData || userData.role !== 'Admin') {
        router.push('/')
        return
      }

      loadEvents()
    }

    checkAuth()
  }, [router])

  async function loadEvents() {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()

      if (data.success) {
        setEvents(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage(t('admin.events.titleRequired'))
      return
    }

    if (!formData.eventDate) {
      setMessage(t('admin.events.dateRequired'))
      return
    }

    try {
      const url = editingEvent
        ? `/api/events/${editingEvent.event_id}`
        : '/api/events'
      const method = editingEvent ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(t('admin.events.savedSuccessfully'))
        resetForm()
        loadEvents()
      } else {
        setMessage(data.error || t('admin.events.saveFailed'))
      }
    } catch (err: any) {
      setMessage(err.message || t('admin.events.saveFailed'))
    }
  }

  function editEvent(event: Event) {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category || '',
      eventDate: event.event_date,
      eventTime: event.event_time || '',
      endDate: event.end_date || '',
      endTime: event.end_time || '',
      location: event.location || '',
      zoomUrl: event.zoom_url || '',
      isOnline: event.is_online,
      registrationRequired: event.registration_required,
      price: event.price.toString(),
      currency: event.currency,
      capacity: event.capacity?.toString() || '',
      status: event.status,
      featuredImage: event.featured_image || '',
    })
  }

  async function deleteEvent(eventId: string) {
    if (!confirm('Delete this event? This will also delete all registrations.')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        loadEvents()
      } else {
        alert(data.error || t('admin.events.deleteFailed'))
      }
    } catch (err: any) {
      alert(err.message || t('admin.events.deleteFailed'))
    }
  }

  function resetForm() {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      eventDate: '',
      eventTime: '',
      endDate: '',
      endTime: '',
      location: '',
      zoomUrl: '',
      isOnline: false,
      registrationRequired: false,
      price: '0',
      currency: 'USD',
      capacity: '',
      status: 'Draft',
      featuredImage: '',
    })
    setMessage(null)
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<FormPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 bg-slate-900/80 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-50 mb-6">
            {editingEvent ? t('admin.events.editEvent') : t('admin.events.addNewEvent')}
          </h2>

          <form onSubmit={saveEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t('admin.events.eventTitle')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder={t('admin.events.category')}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              />
            </div>

            <textarea
              placeholder={t('admin.events.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.eventDate')}</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.eventTime')}</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.endDate')}</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.endTime')}</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-semibold text-slate-300">{t('admin.events.onlineEvent')}</span>
                </label>
                {formData.isOnline && (
                  <input
                    type="url"
                    placeholder={t('admin.events.zoomUrl')}
                    value={formData.zoomUrl}
                    onChange={(e) => setFormData({ ...formData, zoomUrl: e.target.value })}
                    className="w-full mt-2 px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                  />
                )}
              </div>
              {!formData.isOnline && (
                <input
                  type="text"
                  placeholder={t('admin.events.location')}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.registrationRequired}
                    onChange={(e) => setFormData({ ...formData, registrationRequired: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-semibold text-slate-300">{t('admin.events.registrationRequired')}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.price')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.currency')}</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {formData.registrationRequired && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.capacity')}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder={t('admin.events.capacityPlaceholder')}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                >
                  <option value="Draft">{t('admin.events.draft')}</option>
                  <option value="Published">{t('admin.events.published')}</option>
                  <option value="Cancelled">{t('admin.events.cancelled')}</option>
                  <option value="Completed">{t('admin.events.completed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">{t('admin.events.featuredImageUrl')}</label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder={t('admin.events.featuredImagePlaceholder')}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="primary">{t('admin.events.saveEvent')}</Button>
              {editingEvent && (
                <Button type="button" onClick={resetForm} variant="secondary">
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-slate-50 mb-6">{t('admin.events.allEvents')}</h2>

          {events.length === 0 ? (
            <div className="text-slate-400">{t('admin.events.noEventsYet')}</div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-50">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.status === 'Published' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          event.status === 'Draft' ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' :
                          event.status === 'Cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        {event.event_date && (
                          <div>
                            📅 {format(parseISO(event.event_date), 'PP')}
                            {event.event_time && ` at ${event.event_time.substring(0, 5)}`}
                          </div>
                        )}
                        {event.location && !event.is_online && (
                          <div>📍 {event.location}</div>
                        )}
                        {event.is_online && (
                          <div>🌐 {t('admin.events.online')}</div>
                        )}
                        {event.registration_required && (
                          <div>✓ {t('admin.events.registrationRequired')}</div>
                        )}
                        {event.price > 0 ? (
                          <div>💰 {event.currency} {event.price.toFixed(2)}</div>
                        ) : (
                          <div>✓ {t('admin.events.free')}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/events/${event.event_id}`}>
                        <Button variant="secondary" className="text-sm">
                          {t('admin.events.view')}
                        </Button>
                      </Link>
                      <Link href={`/admin/events/${event.event_id}`}>
                        <Button variant="secondary" className="text-sm">
                          {t('admin.events.registrations')}
                        </Button>
                      </Link>
                      <Link href="/admin/events/reports">
                        <Button variant="secondary" className="text-sm">
                          {t('admin.events.reports')}
                        </Button>
                      </Link>
                      <Button
                        onClick={() => editEvent(event)}
                        variant="secondary"
                        className="text-sm"
                      >
                        {t('admin.events.edit')}
                      </Button>
                      <Button
                        onClick={() => deleteEvent(event.event_id)}
                        variant="danger"
                        className="text-sm"
                      >
                        {t('admin.events.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

