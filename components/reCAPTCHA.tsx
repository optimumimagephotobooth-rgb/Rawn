'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      render: (element: HTMLElement, options: any) => number
    }
  }
}

interface reCAPTCHAProps {
  siteKey?: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  action?: string
  invisible?: boolean
}

export function reCAPTCHA({ 
  siteKey, 
  onVerify, 
  onError,
  action = 'submit',
  invisible = true 
}: reCAPTCHAProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    const key = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    
    if (!key) {
      console.warn('reCAPTCHA site key not provided')
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${key}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    if (invisible) {
      // Invisible reCAPTCHA v3
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(key, { action })
              .then((token) => {
                onVerify(token)
              })
              .catch((error) => {
                onError?.(error.message || 'reCAPTCHA verification failed')
              })
          })
        }
      }
    } else {
      // Visible reCAPTCHA v2
      script.onload = () => {
        if (window.grecaptcha && containerRef.current) {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: key,
            callback: (token: string) => {
              onVerify(token)
            },
            'error-callback': () => {
              onError?.('reCAPTCHA verification failed')
            },
          })
        }
      }
    }

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [siteKey, onVerify, onError, action, invisible])

  if (invisible) {
    return null // Invisible reCAPTCHA doesn't render anything
  }

  return <div ref={containerRef} />
}

// Helper function to verify token on server
export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured')
    return true // Allow in development if not configured
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    return data.success === true && data.score >= 0.5 // v3 score threshold
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}
