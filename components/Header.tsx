'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LanguageToggle } from './LanguageToggle'
import { useI18n } from '@/lib/i18n/context'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [otherMenuOpen, setOtherMenuOpen] = useState(false)
  const [visibleLinks, setVisibleLinks] = useState<number[]>([])
  const [overflowLinks, setOverflowLinks] = useState<number[]>([])
  const pathname = usePathname()
  const { t, language } = useI18n()
  const navRef = useRef<HTMLElement>(null)
  const otherButtonRef = useRef<HTMLButtonElement>(null)

  const navLinks = [
    { href: '/about', labelKey: 'nav.about' },
    { href: '/sermons', labelKey: 'nav.sermons' },
    { href: '/sermons/gallery', labelKey: 'nav.gallery' },
    { href: '/blog', labelKey: 'nav.blog' },
    { href: '/events', labelKey: 'nav.events' },
    { href: '/social', labelKey: 'nav.social' },
    { href: '/live', labelKey: 'nav.live' },
    { href: '/prayer-request', labelKey: 'nav.prayer' },
    { href: '/give', labelKey: 'nav.give' },
    { href: '/volunteer', labelKey: 'nav.volunteer' },
  ]

  // Close dropdown on route change
  useEffect(() => {
    setOtherMenuOpen(false)
  }, [pathname])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && otherMenuOpen) {
        setOtherMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [otherMenuOpen])

  // Calculate which links fit and which should go in "Other" dropdown
  useEffect(() => {
    const calculateVisibleLinks = () => {
      if (!navRef.current || typeof window === 'undefined') return

      const nav = navRef.current
      const navRect = nav.getBoundingClientRect()
      const availableWidth = navRect.width
      
      // Create temporary elements to measure text width
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.visibility = 'hidden'
      tempContainer.style.whiteSpace = 'nowrap'
      tempContainer.style.fontSize = window.getComputedStyle(nav).fontSize
      tempContainer.style.fontWeight = window.getComputedStyle(nav).fontWeight
      tempContainer.style.fontFamily = window.getComputedStyle(nav).fontFamily
      document.body.appendChild(tempContainer)
      
      const gap = 16 // gap-4 = 1rem = 16px
      const otherButtonWidth = 100 // Estimate for "Other" button + gap
      
      const visible: number[] = []
      const overflow: number[] = []
      let totalWidth = 0
      
      navLinks.forEach((link, index) => {
        tempContainer.textContent = t(link.labelKey)
        const linkWidth = tempContainer.offsetWidth + gap
        
        // Check if this link would fit (accounting for "Other" button if we already have overflow)
        const needsOtherButton = overflow.length > 0 || (totalWidth + linkWidth + otherButtonWidth > availableWidth && index < navLinks.length - 1)
        const reservedForOther = needsOtherButton ? otherButtonWidth : 0
        
        if (totalWidth + linkWidth + reservedForOther <= availableWidth) {
          visible.push(index)
          totalWidth += linkWidth
        } else {
          overflow.push(index)
        }
      })
      
      document.body.removeChild(tempContainer)
      
      setVisibleLinks(visible)
      setOverflowLinks(overflow)
    }

    // Calculate on mount, language change, and window resize
    const timeout = setTimeout(calculateVisibleLinks, 50)
    window.addEventListener('resize', calculateVisibleLinks)
    
    return () => {
      window.removeEventListener('resize', calculateVisibleLinks)
      clearTimeout(timeout)
    }
  }, [language, t, navLinks])

  // Hide header on admin and dashboard pages
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/teacher') || pathname?.startsWith('/student')
  
  if (isAdminPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-2">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative shrink-0">
              {/* Main logo icon with enhanced design */}
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 shadow-lg shadow-rose-500/50 flex items-center justify-center overflow-hidden group-hover:shadow-rose-500/70 transition-all duration-300">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/30 via-transparent to-indigo-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Letter R with better styling */}
                <span className="relative text-xl font-black tracking-tighter text-white z-10">R</span>
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-amber-200/40 rounded-bl-lg"></div>
              </div>
              {/* Subtle glow effect on hover */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-400/20 via-rose-500/20 to-indigo-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight text-slate-50 whitespace-nowrap group-hover:text-amber-200 transition-colors">
                  RAWN
                </span>
                <span className="text-xs font-medium tracking-wider uppercase text-amber-400/80 whitespace-nowrap">
                  Ministry
                </span>
              </div>
              <div className="text-[10px] text-slate-400/70 group-hover:text-slate-300/90 transition-colors whitespace-nowrap mt-0.5 tracking-wide">
                Raising A Warrior Nation
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            ref={navRef}
            className="hidden lg:flex items-center gap-4 text-xs xl:text-sm font-medium text-slate-200 flex-1 justify-center px-2 xl:px-6 2xl:px-8 min-w-0"
          >
            {visibleLinks.length === 0 ? (
              // Show all links while calculating (initial render)
              navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-amber-300 transition-colors whitespace-nowrap"
                >
                  {t(link.labelKey)}
                </Link>
              ))
            ) : (
              <>
                {visibleLinks.map((index) => {
                  const link = navLinks[index]
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="hover:text-amber-300 transition-colors whitespace-nowrap"
                    >
                      {t(link.labelKey)}
                    </Link>
                  )
                })}
                
                {/* "Other" dropdown for overflow items */}
                {overflowLinks.length > 0 && (
                  <div className="relative">
                    <button
                      ref={otherButtonRef}
                      onClick={() => setOtherMenuOpen(!otherMenuOpen)}
                      className="hover:text-amber-300 transition-colors whitespace-nowrap flex items-center gap-1"
                      aria-label={t('header.other')}
                      aria-expanded={otherMenuOpen}
                    >
                      {t('header.other')}
                      <svg
                        className={`w-4 h-4 transition-transform ${otherMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {otherMenuOpen && (
                      <>
                        {/* Backdrop to close on click outside */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOtherMenuOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                          {overflowLinks.map((index) => {
                            const link = navLinks[index]
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block px-4 py-2 text-sm text-slate-200 hover:text-amber-300 hover:bg-white/5 transition-colors whitespace-nowrap"
                                onClick={() => setOtherMenuOpen(false)}
                              >
                                {t(link.labelKey)}
                              </Link>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 shrink-0">
            <LanguageToggle />
            <Link
              href="/login"
              className="hidden xl:inline-flex text-[10px] xl:text-xs font-semibold px-2 xl:px-3 py-2 rounded-full border border-white/20 text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {t('header.adminLogin')}
            </Link>
            <Link
              href="#join"
              className="inline-flex text-[10px] sm:text-xs xl:text-sm font-semibold px-2 sm:px-3 xl:px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-slate-950 shadow-md shadow-rose-500/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
            >
              <span className="hidden lg:inline">{t('header.joinMovement')}</span>
              <span className="lg:hidden">{t('header.join')}</span>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 hover:text-amber-300 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-950/98 backdrop-blur-sm">
            <nav className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                href="/login"
                className="block py-2 text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.adminLogin')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

