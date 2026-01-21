'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

function LoginContent() {
  const { t } = useI18n()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error query parameter from callback
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(
        errorParam === 'auth_failed'
          ? t('auth.authenticationFailed')
          : t('auth.errorOccurred')
      )
    }
  }, [searchParams, t])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (signInError) throw signInError

      // Redirect will happen automatically
    } catch (err: any) {
      setError(err.message || t('auth.failedToSignIn'))
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError(t('auth.fillAllFields'))
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      if (isSignUp) {
        // Sign up
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || t('auth.failedToSignUp'))
        }

        if (data.requiresConfirmation) {
          setSuccess(t('auth.checkEmailConfirmation'))
          setIsSignUp(false)
          setIsLoading(false)
          return
        }

        if (data.requiresOnboarding) {
          router.push('/onboarding')
          return
        }

        // User is signed in and has a church
        router.push('/dashboard')
      } else {
        // Sign in
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || t('auth.failedToSignIn'))
        }

        if (data.requiresOnboarding) {
          router.push('/onboarding')
          return
        }

        // User is signed in
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? t('auth.failedToSignUp') : t('auth.failedToSignIn')))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-50">{t('auth.title')}</h1>
          <p className="mt-2 text-slate-300/90">
            {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                disabled={isLoading}
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-slate-400">
                  {t('auth.passwordMinLength')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              variant="primary"
            >
              {isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/80 text-slate-400">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            isLoading={isLoading}
            className="w-full bg-slate-950/80 border border-white/10 text-slate-50 hover:bg-slate-800/80"
            variant="secondary"
          >
            {t('auth.signInWithGoogle')}
          </Button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccess(null)
              }}
              className="text-sm text-amber-200/90 hover:text-amber-100 font-medium"
              disabled={isLoading}
            >
              {isSignUp
                ? t('auth.alreadyHaveAccount')
                : t('auth.dontHaveAccount')}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            {t('auth.termsOfService')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

