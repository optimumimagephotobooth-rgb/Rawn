'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface Event {
  id: string
  event_id: string
  title: string
  event_date: string
  event_time: string | null
}

interface Registration {
  id: string
  event_id: string
  name: string
  email: string
  phone: string | null
  status: string
  registered_at: string
  notes: string | null
}

export default function EventRegistrationsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

      loadData()
    }

    checkAuth()
  }, [router, eventId])

  async function loadData() {
    try {
      // Load event
      const eventResponse = await fetch(`/api/events/${eventId}`)
      const eventData = await eventResponse.json()
      if (eventData.success) {
        setEvent(eventData.data)
      }

      // Load registrations
      const regResponse = await fetch(`/api/events/${eventId}/registrations`)
      const regData = await regResponse.json()
      if (regData.success) {
        setRegistrations(regData.data || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateRegistrationStatus(registrationId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Reload data to show updated status
        loadData()
      } else {
        alert(data.error || 'Update failed')
      }
    } catch (err: any) {
      alert(err.message || 'Update failed')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <p className="text-gray-700 mb-4">Event not found</p>
          <Link href="/admin/events">
            <Button variant="primary">Back to Events</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const registeredCount = registrations.filter(r => r.status === 'Registered').length
  const attendedCount = registrations.filter(r => r.status === 'Attended').length
  const cancelledCount = registrations.filter(r => r.status === 'Cancelled').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-500 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <strong className="text-lg">RAWN Ministry — Event Registrations</strong>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/admin/events" className="hover:underline">Events</Link>
            <Link href="/login" className="hover:underline">Logout</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="mb-6">
          <Link href="/admin/events" className="text-primary-500 hover:underline text-sm mb-4 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
          {event.event_date && (
            <p className="text-gray-600">
              {format(parseISO(event.event_date), 'PP')}
              {event.event_time && ` at ${event.event_time.substring(0, 5)}`}
            </p>
          )}
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registration Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{registeredCount}</div>
              <div className="text-sm text-green-600">Registered</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{attendedCount}</div>
              <div className="text-sm text-blue-600">Attended</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{cancelledCount}</div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Registrations</h2>

          {registrations.length === 0 ? (
            <div className="text-gray-500">No registrations yet.</div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{reg.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          reg.status === 'Registered' ? 'bg-green-100 text-green-700' :
                          reg.status === 'Attended' ? 'bg-blue-100 text-blue-700' :
                          reg.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {reg.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📧 {reg.email}</div>
                        {reg.phone && <div>📞 {reg.phone}</div>}
                        <div>📅 Registered {format(parseISO(reg.registered_at), 'PPp')}</div>
                        {reg.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                            <strong>Notes:</strong> {reg.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <select
                        value={reg.status}
                        onChange={(e) => updateRegistrationStatus(reg.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Attended">Attended</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-Show">No-Show</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}

