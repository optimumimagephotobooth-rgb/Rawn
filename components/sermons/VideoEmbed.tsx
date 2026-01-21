'use client'

import { useMemo } from 'react'

interface VideoEmbedProps {
  url: string
  title?: string
  className?: string
}

/**
 * Extracts video ID from YouTube or Vimeo URL and returns embed URL
 */
function getEmbedUrl(url: string): string | null {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

export function VideoEmbed({ url, title, className = '' }: VideoEmbedProps) {
  const embedUrl = useMemo(() => getEmbedUrl(url), [url])

  if (!embedUrl) {
    // Fallback to link if URL doesn't match YouTube/Vimeo patterns
    return (
      <div className={`rounded-lg overflow-hidden bg-slate-900/60 border border-white/10 ${className}`}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-8 text-center text-amber-200/90 hover:text-amber-100 transition-colors"
        >
          <div className="text-4xl mb-2">🎥</div>
          <div className="font-semibold">Watch Video</div>
          <div className="text-sm text-slate-400 mt-1">Click to open in new tab</div>
        </a>
      </div>
    )
  }

  const isVimeo = embedUrl.includes('vimeo.com')

  return (
    <div className={`rounded-lg overflow-hidden bg-slate-900/60 border border-white/10 ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
