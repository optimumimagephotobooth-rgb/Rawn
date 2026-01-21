'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Language } from '@/lib/i18n/translations'

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages: { code: Language; label: string; flag: string; countryCode: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸', countryCode: 'us' },
    { code: 'es', label: 'Español', flag: '🇪🇸', countryCode: 'es' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', countryCode: 'FR' },
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current && 
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside)
      return () => window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 xl:px-3 py-1.5 bg-slate-800/80 border border-amber-400/60 text-slate-200 rounded-lg text-xs xl:text-sm hover:text-amber-300 transition-colors flex items-center gap-1.5 shadow-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-[10px] xl:text-xs text-slate-300/80 uppercase">{currentLanguage.countryCode}</span>
        <span>{currentLanguage.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-2 min-w-[180px] z-[300]"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'rgb(15 23 42)' }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full relative z-[200] text-left px-4 py-2 text-sm text-slate-200 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  language === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-600 hover:text-white'
                }`}
              >
                <span className="text-[10px] text-slate-300/80 uppercase">{lang.countryCode}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
