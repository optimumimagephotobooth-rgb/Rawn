'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

interface Prayer {
  id: string
  prayer_id: string
  name: string | null
  content: string
  created_at: string
}

export default function PublicPrayerPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPrayers() {
      try {
        const response = await fetch('/api/prayers?status=prayed')
        const data = await response.json()

        if (data.success) {
          setPrayers(data.data || [])
        }
      } catch (err) {
        console.error('Failed to load prayers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrayers()
  }, [])

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="bg-slate-900/80 border-b border-white/10 text-slate-50 py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">RAWN Ministry Prayer Wall</h1>
        <p className="text-amber-200/90">Praying together as a community</p>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-slate-50 mb-2 text-center">Prayer Requests</h2>
        <p className="text-slate-300/90 text-center mb-8">
          These prayers have been prayed for by our pastoral team.
        </p>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading prayers…</div>
        ) : prayers.length === 0 ? (
          <div className="text-center text-slate-400">
            No prayers available yet. Please check back soon.
          </div>
        ) : (
          <div className="space-y-4">
            {prayers.map((prayer) => (
              <Card key={prayer.id} className="bg-slate-900/80 border border-white/10">
                <div className="text-sm text-slate-400 mb-2">
                  <strong className="text-slate-200">{prayer.name || 'Anonymous'}</strong>
                  {prayer.created_at && (
                    <> • {format(new Date(prayer.created_at), 'MMM d, yyyy')}</>
                  )}
                </div>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {prayer.content}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

