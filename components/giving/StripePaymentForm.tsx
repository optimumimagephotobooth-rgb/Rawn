'use client'

import { useState, FormEvent } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/Button'

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function StripePaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/give/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || 'Payment failed')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment processing failed'
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border border-white/10 bg-slate-950/80">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {message}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isProcessing}
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:from-amber-300 hover:to-rose-400"
      >
        {isProcessing ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
      </Button>
    </form>
  )
}
