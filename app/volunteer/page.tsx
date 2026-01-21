'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

export default function VolunteerPage() {
  const { t } = useI18n()
  
  const departments = [
    { value: 'Prayer', label: t('volunteer.page.departments.prayer') },
    { value: 'Media', label: t('volunteer.page.departments.media') },
    { value: 'Events', label: t('volunteer.page.departments.events') },
    { value: 'Teaching', label: t('volunteer.page.departments.teaching') },
    { value: 'Administration', label: t('volunteer.page.departments.administration') },
    { value: 'Outreach', label: t('volunteer.page.departments.outreach') },
  ]
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    skills: '',
    availability: '',
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
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          skills: '',
          availability: '',
          notes: '',
        })
      } else {
        setMessage(data.error || t('volunteer.page.error'))
        setIsSuccess(false)
      }
    } catch (err: any) {
      setMessage(err.message || t('volunteer.page.error'))
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
            backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('volunteer.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('volunteer.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('nav.volunteer')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('volunteer.page.subtitle')}
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
                  {t('volunteer.page.successTitle')}
                </h2>
                <p className="text-slate-300 mb-6">
                  {t('volunteer.page.successMessage')}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsSuccess(false)}
                  className="bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950"
                >
                  {t('volunteer.page.submitAnother')}
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-50 mb-6">{t('volunteer.page.formTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        {t('volunteer.page.name')}
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
                        {t('volunteer.page.email')}
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
                      {t('volunteer.page.phone')}
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
                      {t('volunteer.page.department')}
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      <option value="">{t('volunteer.page.selectDepartment')}</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('volunteer.page.skills')}
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder={t('volunteer.page.skillsPlaceholder')}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('volunteer.page.availability')}
                    </label>
                    <textarea
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      placeholder={t('volunteer.page.availabilityPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      {t('volunteer.page.notes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('volunteer.page.notesPlaceholder')}
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
                    {t('volunteer.page.submitButton')}
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

