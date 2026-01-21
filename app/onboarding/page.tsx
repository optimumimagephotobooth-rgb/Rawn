'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function OnboardingPage() {
  const [churchName, setChurchName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!churchName.trim()) {
      setError('Church name is required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: churchName.trim() }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create church')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4">
      <Card className="max-w-md w-full bg-slate-900/80 border border-white/10">
        <h2 className="text-2xl font-bold text-slate-50 mb-2">Set up your Church</h2>
        <p className="text-slate-300/90 mb-6">
          You're almost ready. Create your church workspace to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="churchName" className="block text-sm font-semibold text-slate-200 mb-2">
            Church Name
          </label>
          <input
            id="churchName"
            type="text"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            placeholder="e.g. RAWN Ministry"
            className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent mb-4 placeholder:text-slate-500"
            disabled={isLoading}
          />

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            variant="primary"
          >
            Create Church & Continue
          </Button>
        </form>
      </Card>
    </div>
  )
}

