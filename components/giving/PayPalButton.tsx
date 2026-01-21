'use client'

import { useEffect, useRef, useState } from 'react'

interface PayPalButtonProps {
  amount: number
  currency: string
  donationId: string
  onSuccess: () => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

export function PayPalButton({
  amount,
  currency,
  donationId,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!paypalRef.current) {
      return
    }

    function renderPayPalButton() {
      if (!paypalRef.current || !window.paypal) {
        return
      }

      // Clear existing content
      paypalRef.current.innerHTML = ''

      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          },
          createOrder: async (data: any, actions: any) => {
            try {
              const response = await fetch('/api/giving/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount,
                  currency,
                  donationId,
                }),
              })

              const orderData = await response.json()
              if (!orderData.success) {
                throw new Error(orderData.error || 'Failed to create PayPal order')
              }

              return orderData.data.orderId
            } catch (err: any) {
              onError(err.message || 'Failed to create PayPal order')
              throw err
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const response = await fetch('/api/giving/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  donationId,
                }),
              })

              const captureData = await response.json()
              if (!captureData.success) {
                throw new Error(captureData.error || 'Failed to capture PayPal payment')
              }

              onSuccess()
            } catch (err: any) {
              onError(err.message || 'Failed to capture PayPal payment')
            }
          },
          onError: (err: any) => {
            onError(err.message || 'PayPal payment failed')
          },
        })
        .render(paypalRef.current)
    }

    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      setIsLoaded(true)
      renderPayPalButton()
      return
    }

    // Load PayPal SDK
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''}&currency=${currency}`
    script.async = true
    script.onload = () => {
      setIsLoaded(true)
      renderPayPalButton()
    }
    script.onerror = () => {
      onError('Failed to load PayPal SDK. Please check your PayPal client ID configuration.')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`)
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [amount, currency, donationId, onSuccess, onError])

  if (!isLoaded) {
    return (
      <div className="p-4 rounded-lg border border-white/10 bg-slate-950/80 text-center text-slate-400">
        Loading PayPal...
      </div>
    )
  }

  return (
    <div>
      <div ref={paypalRef} className="w-full" />
    </div>
  )
}
