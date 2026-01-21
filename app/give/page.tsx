'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { StripePaymentForm } from '@/components/giving/StripePaymentForm'
import { PayPalButton } from '@/components/giving/PayPalButton'
import { useI18n } from '@/lib/i18n/context'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Scripture {
  id: string
  reference: string
  verse_text: string
}

interface Testimony {
  id: string
  name: string
  testimony: string
  is_anonymous: boolean
}

export default function GivePage() {
  const { t } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    paymentMethod: 'Stripe',
    isRecurring: false,
  })
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptures, setScriptures] = useState<Scripture[]>([])
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commitmentLevel: 'Monthly',
  })

  const presetAmounts = [25, 50, 100, 250, 500]

  useEffect(() => {
    // Load scriptures
    fetch('/api/giving/scriptures')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScriptures(data.data || [])
        }
      })
      .catch(console.error)

    // Load testimonies
    fetch('/api/giving/testimonies?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTestimonies(data.data || [])
        }
      })
      .catch(console.error)
  }, [])

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/giving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || t('give.page.error'))
      }

      setPaymentData(data.data)
      setStep('payment')
    } catch (err: any) {
      setError(err.message || t('give.page.error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push(`/give/success?donation_id=${paymentData.donation.donation_id}`)
  }

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerFormData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || t('give.page.partnerError'))
      }

      setShowPartnerForm(false)
      setPartnerFormData({ name: '', email: '', phone: '', commitmentLevel: 'Monthly' })
      alert(t('give.page.partnerSuccess'))
    } catch (err: any) {
      setError(err.message || t('give.page.partnerError'))
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === 'payment' && paymentData) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
                {t('give.page.completeTitle')}
              </h1>
              <p className="text-lg text-slate-300/90">
                {t('give.page.amount')}: {paymentData.donation.currency} {parseFloat(paymentData.donation.amount).toFixed(2)}
              </p>
            </div>

            <Card className="bg-slate-900/80 border border-white/10">
              {formData.paymentMethod === 'Stripe' && paymentData.clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: paymentData.clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#fbbf24',
                        colorBackground: '#0f172a',
                        colorText: '#f1f5f9',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    clientSecret={paymentData.clientSecret}
                    amount={parseFloat(paymentData.donation.amount)}
                    currency={paymentData.donation.currency}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => setError(err)}
                  />
                </Elements>
              ) : formData.paymentMethod === 'PayPal' ? (
                <PayPalButton
                  amount={parseFloat(paymentData.donation.amount)}
                  currency={paymentData.donation.currency}
                  donationId={paymentData.donation.donation_id}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setError(err)}
                />
              ) : null}

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="secondary"
                onClick={() => setStep('form')}
                className="w-full mt-4"
              >
                {t('give.page.backButton')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('give.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('give.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                RAWN Ministry
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('give.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Scriptures & Testimonies */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">{t('give.page.scriptureTitle')}</h2>
              <div className="space-y-4 text-sm text-slate-300">
                {scriptures.length > 0 ? (
                  scriptures.slice(0, 2).map((scripture) => (
                    <div key={scripture.id}>
                      <p className="italic">"{scripture.verse_text}"</p>
                      <p className="text-amber-200/90 mt-2">— {scripture.reference}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <p className="italic">
                      "{t('give.page.defaultScripture')}"
                    </p>
                    <p className="text-amber-200/90">— {t('give.page.defaultScriptureRef')}</p>
                  </>
                )}
              </div>
            </Card>

            {testimonies.length > 0 && (
              <Card className="bg-slate-900/80 border border-white/10">
                <h2 className="text-xl font-semibold text-slate-50 mb-4">{t('give.page.testimoniesTitle')}</h2>
                <div className="space-y-4 text-sm text-slate-300">
                  {testimonies.slice(0, 2).map((testimony) => (
                    <div key={testimony.id} className="border-l-2 border-amber-400/50 pl-4">
                      <p className="italic">"{testimony.testimony}"</p>
                      <p className="text-amber-200/90 mt-2">
                        — {testimony.is_anonymous ? t('give.page.anonymousPartner') : testimony.name}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">{t('give.page.partnerTitle')}</h2>
              <p className="text-sm text-slate-300 mb-4">
                {t('give.page.partnerDescription')}
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowPartnerForm(!showPartnerForm)}
                className="w-full"
              >
                {showPartnerForm ? t('common.cancel') : t('give.page.partnerSignup')}
              </Button>

              {showPartnerForm && (
                <form onSubmit={handlePartnerSubmit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder={t('give.page.partnerName')}
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
                  />
                  <input
                    type="email"
                    placeholder={t('give.page.partnerEmail')}
                    value={partnerFormData.email}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder={t('give.page.partnerPhone')}
                    value={partnerFormData.phone}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  <select
                    value={partnerFormData.commitmentLevel}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, commitmentLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value="Monthly">{t('give.page.monthly')}</option>
                    <option value="Quarterly">{t('give.page.quarterly')}</option>
                    <option value="Annual">{t('give.page.annual')}</option>
                    <option value="One-time">{t('give.page.oneTime')}</option>
                  </select>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isProcessing}
                    className="w-full"
                  >
                    {t('give.page.partnerSubmit')}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column - Donation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-6">{t('give.page.donationTitle')}</h2>

              <form onSubmit={handleDonationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    {t('give.page.amountLabel')}
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                        className={`px-3 py-2 rounded-lg border text-sm ${formData.amount === amt.toString()
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-950/80 border-white/10 text-slate-50 hover:border-amber-400/50'
                          }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder={t('give.page.customAmount')}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    {t('give.page.donorName')}
                  </label>
                  <input
                    type="text"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    {t('give.page.donorEmail')}
                  </label>
                  <input
                    type="email"
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    {t('give.page.paymentMethod')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'Stripe' })}
                      className={`px-4 py-3 rounded-lg border text-sm font-semibold ${formData.paymentMethod === 'Stripe'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950/80 border-white/10 text-slate-50 hover:border-amber-400/50'
                        }`}
                    >
                      💳 Card (Stripe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'PayPal' })}
                      className={`px-4 py-3 rounded-lg border text-sm font-semibold ${formData.paymentMethod === 'PayPal'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950/80 border-white/10 text-slate-50 hover:border-amber-400/50'
                        }`}
                    >
                      🅿️ PayPal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-200">{t('give.page.recurring')}</span>
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:from-amber-300 hover:to-rose-400"
                >
                  {t('give.page.continueButton')}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
