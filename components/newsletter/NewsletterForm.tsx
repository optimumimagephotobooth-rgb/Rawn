'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

interface NewsletterFormProps {
  source?: string
  churchId?: string | null
  className?: string
}

export function NewsletterForm({ source = 'website', churchId = null, className = '' }: NewsletterFormProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, churchId }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setEmail('')
        setMessage(data.message)
      } else {
        setMessage(data.error || t('newsletter.error'))
        setIsSuccess(false)
      }
    } catch (err: any) {
      setMessage(err.message || t('newsletter.error'))
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`p-4 rounded-lg bg-green-500/20 border border-green-500/50 ${className}`}>
        <p className="text-green-200 text-sm">{message || t('newsletter.success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.placeholder')}
          className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-slate-950/80 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="bg-amber-400 text-slate-950 hover:bg-amber-300"
        >
          {t('newsletter.subscribe')}
        </Button>
      </div>
      {message && !isSuccess && (
        <p className="mt-2 text-sm text-red-200">{message}</p>
      )}
    </form>
  )
}

