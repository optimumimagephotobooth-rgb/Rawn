'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO, isPast } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

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
  registrationCount?: number
  isFull?: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string; id: string } | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      // Get session details and complete registration
      const response = await fetch(`/api/events/${eventId}/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRegistrationSuccess(true)
        setPaymentIntent(null)
        setFormData({ name: '', email: '', phone: '', notes: '' })
      } else {
        setError(data.error || 'Registration completion failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration')
    }
  }

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        const data = await response.json()

        if (data.success) {
          setEvent(data.data)
        } else {
          setError('Event not found')
        }
      } catch (err) {
        console.error('Failed to load event:', err)
        setError('Failed to load event')
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }

    // Check for payment success callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const payment = urlParams.get('payment')
      const sessionId = urlParams.get('session_id')

      if (payment === 'success' && sessionId) {
        // Complete registration after successful payment
        handlePaymentSuccess(sessionId)
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [eventId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // If payment is required, store payment intent and show payment form
        if (data.requiresPayment && data.paymentIntent) {
          setPaymentIntent(data.paymentIntent)
        } else {
          // Free event - registration complete
          setRegistrationSuccess(true)
          setFormData({ name: '', email: '', phone: '', notes: '' })
        }
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsRegistering(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentIntent) return

    setIsProcessingPayment(true)
    setError(null)

    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // For simplicity, we'll use confirmCardPayment with a redirect
      // In production, you'd collect card details via Stripe Elements
      // For now, redirect to a checkout page or use Stripe Checkout Session
      
      // Alternative: Create a Stripe Checkout Session
      const checkoutResponse = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          paymentIntentId: paymentIntent.id,
          ...formData,
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (checkoutData.success && checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        // Fallback: Use Payment Intent confirmation
        // Note: This requires card collection UI
        setError('Payment processing is not fully configured. Please contact support.')
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading event...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-900/80 border border-white/10 text-center p-8">
          <p className="text-slate-300 mb-4">{error}</p>
          <Link href="/events">
            <Button variant="primary">Back to Events</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!event) return null

  const eventDate = parseISO(event.event_date)
  const isEventPast = isPast(eventDate)

  const formatEventDate = () => {
    let dateStr = format(eventDate, 'EEEE, MMMM d, yyyy')
    
    if (event.event_time) {
      const time = event.event_time.substring(0, 5)
      dateStr += ` at ${time}`
    }

    if (event.end_date && event.end_date !== event.event_date) {
      const endDate = parseISO(event.end_date)
      dateStr += ` - ${format(endDate, 'EEEE, MMMM d, yyyy')}`
      if (event.end_time) {
        dateStr += ` at ${event.end_time.substring(0, 5)}`
      }
    }

    return dateStr
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-amber-200/90 hover:text-amber-100 text-sm mb-6"
        >
          ← Back to Events
        </Link>

        {event.featured_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={event.featured_image}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div>
              {event.category && (
                <span className="inline-block text-xs font-semibold text-amber-200/90 uppercase tracking-wide mb-3">
                  {event.category}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 mb-4">
                {event.title}
              </h1>
            </div>

            <Card className="bg-slate-900/80 border border-white/10">
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="text-amber-200/80 text-lg">📅</span>
                  <div>
                    <div className="font-semibold text-slate-50 mb-1">Date & Time</div>
                    <div>{formatEventDate()}</div>
                  </div>
                </div>

                {event.location && !event.is_online && (
                  <div className="flex items-start gap-3">
                    <span className="text-amber-200/80 text-lg">📍</span>
                    <div>
                      <div className="font-semibold text-slate-50 mb-1">Location</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                )}

                {event.is_online && (
                  <div className="flex items-start gap-3">
                    <span className="text-amber-200/80 text-lg">🌐</span>
                    <div>
                      <div className="font-semibold text-slate-50 mb-1">Event Type</div>
                      <div>Online Event</div>
                      {event.zoom_url && (
                        <a
                          href={event.zoom_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-200/90 hover:text-amber-100 underline mt-1 inline-block"
                        >
                          Join Zoom Meeting →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="text-amber-200/80 text-lg">💰</span>
                  <div>
                    <div className="font-semibold text-slate-50 mb-1">Cost</div>
                    <div>
                      {event.price > 0 ? (
                        <span>{event.currency} {event.price.toFixed(2)}</span>
                      ) : (
                        <span className="text-green-400">Free</span>
                      )}
                    </div>
                  </div>
                </div>

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <span className="text-amber-200/80 text-lg">👥</span>
                    <div>
                      <div className="font-semibold text-slate-50 mb-1">Capacity</div>
                      <div>
                        {event.registrationCount || 0} / {event.capacity} registered
                        {event.isFull && (
                          <span className="text-red-400 ml-2">(Full)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {event.description && (
              <Card className="bg-slate-900/80 border border-white/10">
                <h2 className="text-xl font-semibold text-slate-50 mb-3">About This Event</h2>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </div>
              </Card>
            )}
          </div>

          {event.registration_required && !isEventPast && (
            <div>
              <Card className="bg-slate-900/80 border border-white/10 sticky top-4">
                {registrationSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="text-4xl">✅</div>
                    <h3 className="text-xl font-semibold text-slate-50">
                      Registration Successful!
                    </h3>
                    <p className="text-slate-300 text-sm">
                      You've been registered for this event. We'll send you a confirmation email shortly.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setRegistrationSuccess(false)}
                      className="w-full"
                    >
                      Register Another Person
                    </Button>
                  </div>
                ) : paymentIntent ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-50 mb-4">
                      Complete Payment
                    </h3>
                    <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/50">
                      <p className="text-slate-200 text-sm mb-2">
                        <strong>Event:</strong> {event.title}
                      </p>
                      <p className="text-slate-200 text-sm mb-4">
                        <strong>Amount:</strong> {event.currency} {event.price.toFixed(2)}
                      </p>
                      <p className="text-slate-300 text-xs mb-4">
                        Please complete payment to finalize your registration. You will receive a confirmation email once payment is processed.
                      </p>
                      {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm mb-4">
                          {error}
                        </div>
                      )}
                      <Button
                        onClick={handlePayment}
                        variant="primary"
                        isLoading={isProcessingPayment}
                        className="w-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:from-amber-300 hover:to-rose-400"
                      >
                        {isProcessingPayment ? 'Processing...' : `Pay ${event.currency} ${event.price.toFixed(2)}`}
                      </Button>
                      <Button
                        onClick={() => setPaymentIntent(null)}
                        variant="secondary"
                        className="w-full mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-slate-50 mb-4">
                      Register for Event
                    </h3>
                    {event.isFull ? (
                      <div className="text-center py-6">
                        <p className="text-red-400 font-semibold mb-2">Event is Full</p>
                        <p className="text-slate-400 text-sm">
                          This event has reached capacity. Please check back for cancellations.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                            {error}
                          </div>
                        )}

                        {event.price > 0 && (
                          <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/50">
                            <p className="text-slate-200 text-sm">
                              <strong>Event Fee:</strong> {event.currency} {event.price.toFixed(2)}
                            </p>
                            <p className="text-slate-300 text-xs mt-1">
                              Payment will be required after registration.
                            </p>
                          </div>
                        )}

                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
                            Name *
                          </label>
                          <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                            Email *
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-slate-200 mb-2">
                            Phone (optional)
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div>
                          <label htmlFor="notes" className="block text-sm font-semibold text-slate-200 mb-2">
                            Notes (optional)
                          </label>
                          <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-y"
                            placeholder="Any special requests or questions..."
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isRegistering}
                          className="w-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:from-amber-300 hover:to-rose-400"
                        >
                          {event.price > 0 ? 'Continue to Payment' : 'Register Now'}
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

