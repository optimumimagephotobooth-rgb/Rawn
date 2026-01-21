'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSearchParams } from 'next/navigation'

function GiveSuccessContent() {
  const searchParams = useSearchParams()
  const donationId = searchParams.get('donation_id')

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
      <Card className="bg-slate-900/80 border border-white/10 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-slate-50 mb-4">
          Thank You for Your Donation!
        </h1>
        <p className="text-slate-300 mb-6">
          Your generous gift helps us equip warriors for Jesus across the nations.
          A receipt has been sent to your email.
        </p>
        {donationId && (
          <p className="text-xs text-slate-400 mb-6">
            Donation ID: {donationId}
          </p>
        )}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="primary" className="w-full">
              Return Home
            </Button>
          </Link>
          <Link href="/give" className="flex-1">
            <Button variant="secondary" className="w-full">
              Give Again
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function GiveSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-900/80 border border-white/10 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-semibold text-slate-50 mb-4">
            Thank You for Your Donation!
          </h1>
          <p className="text-slate-300 mb-6">
            Your generous gift helps us equip warriors for Jesus across the nations.
            A receipt has been sent to your email.
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="primary" className="w-full">
                Return Home
              </Button>
            </Link>
            <Link href="/give" className="flex-1">
              <Button variant="secondary" className="w-full">
                Give Again
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    }>
      <GiveSuccessContent />
    </Suspense>
  )
}

