'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

export function Footer() {
  const { t } = useI18n()
  const pathname = usePathname()
  
  // Hide footer on admin and dashboard pages (they have their own layout)
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/teacher') || pathname?.startsWith('/student')
  
  if (isAdminPage) {
    return null
  }

  return (
    <footer className="border-t border-white/10 bg-slate-950/90">
      <div className="max-w-[1440px] mx-auto px-4 py-4 text-xs text-slate-400 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-slate-200 text-sm">RAWN Ministry</div>
          <div className="text-slate-400/80">
            &copy; {new Date().getFullYear()} RAWN Ministry. {t('footer.copyright')}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-amber-300 transition-colors">
            {t('footer.aboutRawn')}
          </Link>
          <Link href="/privacy" className="hover:text-amber-300 transition-colors">
            {t('footer.privacy')}
          </Link>
          <Link href="/contact" className="hover:text-amber-300 transition-colors">
            {t('footer.contact')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
