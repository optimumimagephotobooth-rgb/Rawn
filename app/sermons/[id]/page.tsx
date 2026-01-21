'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import { Sermon } from '@/types/sermon'
import { VideoEmbed } from '@/components/sermons/VideoEmbed'
import { AudioPlayer } from '@/components/sermons/AudioPlayer'
import { ShareButtons } from '@/components/social/ShareButtons'

export default function SermonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sermonId = params.id as string

  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSermon() {
      try {
        const response = await fetch('/api/sermons')
        const data = await response.json()

        if (data.success) {
          const found = data.data.find((s: Sermon) => s.sermon_id === sermonId)
          if (found) {
            setSermon(found)
          } else {
            setError('Sermon not found')
          }
        }
      } catch (err) {
        console.error('Failed to load sermon:', err)
        setError('Failed to load sermon')
      } finally {
        setIsLoading(false)
      }
    }

    if (sermonId) {
      loadSermon()
    }
  }, [sermonId])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading sermon...</div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-900/80 border border-white/10 text-center p-8">
          <p className="text-slate-300 mb-4">{error || 'Sermon not found'}</p>
          <Link href="/sermons">
            <Button variant="primary">Back to Sermons</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/sermons"
          className="inline-flex items-center gap-2 text-amber-200/90 hover:text-amber-100 text-sm mb-6"
        >
          ← Back to Sermons
        </Link>

        <Card className="bg-slate-900/80 border border-white/10 mb-8">
          <div className="space-y-4">
            {sermon.category && (
              <span className="inline-block text-xs font-semibold text-amber-200/90 uppercase tracking-wide">
                {sermon.category}
              </span>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50">
              {sermon.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              {sermon.speaker && <span>By {sermon.speaker}</span>}
              {sermon.date && (
                <span>{format(parseISO(sermon.date), 'MMMM d, yyyy')}</span>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <ShareButtons
                url={`/sermons/${sermon.sermon_id}`}
                title={sermon.title}
                description={sermon.description || ''}
              />
            </div>
          </div>
        </Card>

        {sermon.description && (
          <Card className="bg-slate-900/80 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-slate-50 mb-3">About This Sermon</h2>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {sermon.description}
            </div>
          </Card>
        )}

        {sermon.scripture_references && sermon.scripture_references.length > 0 && (
          <Card className="bg-slate-900/80 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">Scripture References</h2>
            <div className="flex flex-wrap gap-2">
              {sermon.scripture_references.map((reference, index) => {
                // Parse scripture reference (e.g., "John 3:16" or "2 Corinthians 10:4")
                const parts = reference.match(/^(\d*\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/)
                if (parts) {
                  const book = parts[1]
                  const chapter = parts[2]
                  const verseStart = parts[3]
                  const verseEnd = parts[4]
                  const verseRange = verseEnd ? `${verseStart}-${verseEnd}` : verseStart
                  const esvUrl = `https://www.esv.org/${book.replace(/\s+/g, '+')}+${chapter}:${verseRange}/`
                  
                  return (
                    <a
                      key={index}
                      href={esvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200/90 hover:text-amber-100 text-sm transition-colors"
                    >
                      <span>📖</span>
                      <span className="font-medium">{reference}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )
                }
                
                // Fallback for non-standard format
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-sm"
                  >
                    <span>📖</span>
                    <span className="font-medium">{reference}</span>
                  </span>
                )
              })}
            </div>
          </Card>
        )}

        <div className="space-y-8">
          {sermon.video_url && (
            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">Video Sermon</h2>
              <VideoEmbed url={sermon.video_url} title={sermon.title} />
            </Card>
          )}

          {sermon.audio_url && (
            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">Audio Sermon</h2>
              <AudioPlayer url={sermon.audio_url} title={sermon.title} />
            </Card>
          )}

          {sermon.notes_url && (
            <Card className="bg-slate-900/80 border border-white/10">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">Sermon Notes</h2>
              <a
                href={sermon.notes_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200/90 hover:text-amber-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Download PDF Notes</span>
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

