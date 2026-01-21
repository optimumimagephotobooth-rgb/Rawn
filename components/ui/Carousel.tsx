'use client'

import { useState, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CarouselProps {
  children: ReactNode[]
  autoPlay?: boolean
  interval?: number
  className?: string
  showIndicators?: boolean
  showArrows?: boolean
}

export function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  className,
  showIndicators = true,
  showArrows = true,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const items = Array.isArray(children) ? children : [children]

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, items.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  if (items.length === 0) return null

  return (
    <div className={cn('relative w-full', className)}>
      <div className="overflow-hidden rounded-lg w-full">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-full"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/95 backdrop-blur-sm border border-white/30 text-slate-200 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-400/50 transition-all shadow-xl"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/95 backdrop-blur-sm border border-white/30 text-slate-200 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-400/50 transition-all shadow-xl"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showIndicators && items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-8 bg-amber-400'
                  : 'w-2 bg-slate-600 hover:bg-slate-500'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
