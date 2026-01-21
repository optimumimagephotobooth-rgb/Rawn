'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { LanguageToggle } from './LanguageToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Heart,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  Users,
  UserCheck,
  Radio,
  Gamepad2,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  FileEdit,
  User,
} from 'lucide-react'

interface MenuItem {
  href: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  group?: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    loadUser()
  }, [])

  const menuGroups: { titleKey: string; items: MenuItem[] }[] = [
    {
      titleKey: 'adminMenu.main',
      items: [
        { href: '/dashboard', labelKey: 'adminMenu.dashboard', icon: LayoutDashboard },
      ],
    },
    {
      titleKey: 'adminMenu.contentManagement',
      items: [
        { href: '/admin/prayers', labelKey: 'adminMenu.prayers', icon: Heart },
        { href: '/admin/sermons', labelKey: 'adminMenu.sermons', icon: BookOpen },
        { href: '/admin/events', labelKey: 'adminMenu.events', icon: Calendar },
        { href: '/admin/blog', labelKey: 'adminMenu.blog', icon: FileText },
        { href: '/admin/content', labelKey: 'adminMenu.content', icon: FileEdit },
        { href: '/live', labelKey: 'adminMenu.live', icon: Radio },
      ],
    },
    {
      titleKey: 'adminMenu.community',
      items: [
        { href: '/admin/volunteers', labelKey: 'adminMenu.volunteers', icon: Users },
        { href: '/admin/memberships', labelKey: 'adminMenu.memberships', icon: UserCheck },
      ],
    },
    {
      titleKey: 'adminMenu.analytics',
      items: [
        { href: '/admin/donations', labelKey: 'adminMenu.donations', icon: DollarSign },
        { href: '/admin/events/reports', labelKey: 'adminMenu.eventReports', icon: BarChart3 },
        { href: '/admin/gamification', labelKey: 'adminMenu.gamification', icon: Gamepad2 },
      ],
    },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    
    if (href === '/dashboard') {
      return pathname === href
    }
    
    // Collect all hrefs to check for more specific matches
    const allHrefs = menuGroups.flatMap(group => group.items.map(item => item.href))
    
    // Check if this href matches the pathname
    const matches = pathname === href || pathname.startsWith(href + '/')
    
    if (!matches) {
      return false
    }
    
    // If it matches, check if there's a more specific (longer) href that also matches
    // If so, this href should not be active
    const moreSpecificMatch = allHrefs.find(otherHref => {
      if (otherHref === href) return false
      const otherMatches = pathname === otherHref || pathname.startsWith(otherHref + '/')
      return otherMatches && otherHref.length > href.length
    })
    
    return !moreSpecificMatch
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-200 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col z-50 transition-transform duration-300 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with User Info */}
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm z-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <User className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-50 truncate">{t('dashboard.title')}</h1>
              {userEmail && (
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              )}
            </div>
          </div>
          <LanguageToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.titleKey} className="space-y-1.5">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t(group.titleKey)}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-amber-300 hover:border-slate-700/50 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-transform ${
                          active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                        } ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                      />
                      <span className="font-medium text-sm flex-1">{t(item.labelKey)}</span>
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 border border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            <span className="font-medium text-sm flex-1 text-left">
              {isLoggingOut ? t('common.loading') : t('adminMenu.logout')}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
