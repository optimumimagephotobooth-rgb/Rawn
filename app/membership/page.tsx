'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

export default function MembershipPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    date_of_birth: '',
    baptism_date: '',
    previous_church: '',
    how_did_you_hear: '',
    interests: '',
    commitment_level: 'Regular' as 'Regular' | 'Associate' | 'Full',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage(t('membership.page.successMessage'))
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setMessage(data.error || t('membership.page.error'))
        setIsSuccess(false)
      }
    } catch (err: any) {
      setMessage(err.message || t('membership.page.error'))
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                {t('membership.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('membership.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                RAWN Ministry
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('membership.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 shadow-xl">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-semibold text-slate-50 mb-4">
                  {t('membership.page.successTitle')}
                </h2>
                <p className="text-slate-300 mb-6">
                  {t('membership.page.successMessage')}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-50 mb-6">{t('membership.page.formTitle')}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.fullName')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.email')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.address')}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.city')}
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.state')}
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.zipCode')}
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.country')}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.dateOfBirth')}
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('membership.page.baptismDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.baptism_date}
                        onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.previousChurch')}
                    </label>
                    <input
                      type="text"
                      value={formData.previous_church}
                      onChange={(e) => setFormData({ ...formData, previous_church: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.howDidYouHear')}
                    </label>
                    <input
                      type="text"
                      value={formData.how_did_you_hear}
                      onChange={(e) => setFormData({ ...formData, how_did_you_hear: e.target.value })}
                      placeholder={t('membership.page.howDidYouHearPlaceholder')}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.interests')}
                    </label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      placeholder={t('membership.page.interestsPlaceholder')}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.commitmentLevel')}
                    </label>
                    <select
                      value={formData.commitment_level}
                      onChange={(e) => setFormData({ ...formData, commitment_level: e.target.value as 'Regular' | 'Associate' | 'Full' })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      <option value="Regular">{t('membership.page.regularMember')}</option>
                      <option value="Associate">{t('membership.page.associateMember')}</option>
                      <option value="Full">{t('membership.page.fullMember')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('membership.page.additionalNotes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('membership.page.notesPlaceholder')}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-y"
                    />
                  </div>

                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${isSuccess
                        ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                        : 'bg-red-500/20 border border-red-500/50 text-red-200'
                      }`}>
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:from-amber-300 hover:to-rose-400"
                  >
                    {t('membership.page.submitButton')}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

