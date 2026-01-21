'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { reCAPTCHA as ReCAPTCHAComponent } from '@/components/reCAPTCHA'
import { useI18n } from '@/lib/i18n/context'

export default function PrayerRequestPage() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [isConfidential, setIsConfidential] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  useEffect(() => {
    // Trigger reCAPTCHA on mount if available
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      // reCAPTCHA will be triggered automatically by the component
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setMessage(t('prayer.page.emptyError'))
      setIsSuccess(false)
      return
    }

    try {
      setIsLoading(true)
      setMessage(t('prayer.page.submitting'))

      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          content: content.trim(),
          isAnonymous: isConfidential,
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Submission failed')
      }

      setMessage(t('prayer.page.success'))
      setIsSuccess(true)
      setName('')
      setEmail('')
      setContent('')
      setIsConfidential(false)
    } catch (err: any) {
      setMessage(err.message || t('prayer.page.error'))
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
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
            backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('prayer.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('prayer.page.title')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t('prayer.title')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('prayer.page.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 shadow-xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-50 mb-6">{t('prayer.page.formTitle')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
                  {t('prayer.page.nameLabel')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('prayer.page.namePlaceholder')}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                  {t('prayer.page.emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('prayer.page.emailPlaceholder')}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-slate-200 mb-2">
                  {t('prayer.page.contentLabel')}
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('prayer.page.contentPlaceholder')}
                  rows={6}
                  className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent resize-y placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="confidential"
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="mt-1 w-4 h-4 text-amber-400 bg-slate-950 border-white/10 rounded focus:ring-2 focus:ring-amber-400/50"
                  disabled={isLoading}
                />
                <label htmlFor="confidential" className="text-sm text-slate-300 cursor-pointer">
                  {t('prayer.page.confidential')}
                </label>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${isSuccess
                    ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                    : 'bg-red-500/20 border border-red-500/50 text-red-200'
                    }`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">
                {t('prayer.page.submitButton')}
              </Button>
            </form>

            {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <div className="mt-4">
                <ReCAPTCHAComponent
                  onVerify={(token) => setRecaptchaToken(token)}
                  onError={(error) => console.error('reCAPTCHA error:', error)}
                  action="prayer_submit"
                  invisible={true}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

