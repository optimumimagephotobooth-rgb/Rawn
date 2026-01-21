'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { AdminLayout } from '@/components/AdminLayout'
import { useI18n } from '@/lib/i18n/context'
import { DashboardPageSkeleton } from '@/components/ui/Skeleton'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    sermons: 0,
    events: 0,
    blogPosts: 0,
    donations: 0,
    donationsTotal: 0,
    volunteers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Check if user is admin
        const { data: userDataRaw } = await supabase
          .from('users')
          .select('role, church_id')
          .eq('id', user.id)
          .single()

        const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student'; church_id: string | null } | null

        if (!userData || userData.role !== 'Admin') {
          router.push('/')
          return
        }

        const churchId = userData.church_id || 'PUBLIC'

        // Load comprehensive stats
        const [
          usersRes,
          prayersRes,
          sermonsRes,
          eventsRes,
          blogRes,
          donationsRes,
          volunteersRes,
        ] = await Promise.all([
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('church_id', churchId),
          supabase
            .from('prayers')
            .select('status')
            .eq('church_id', churchId),
          supabase
            .from('sermons')
            .select('id', { count: 'exact', head: true })
            .eq('church_id', churchId),
          supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('church_id', churchId),
          supabase
            .from('blog_posts')
            .select('id', { count: 'exact', head: true })
            .eq('church_id', churchId),
          supabase
            .from('donations')
            .select('amount, status')
            .eq('church_id', churchId),
          supabase
            .from('volunteers')
            .select('id', { count: 'exact', head: true })
            .eq('church_id', churchId),
        ])

        const prayers = prayersRes.data || []
        const statusCounts = prayers.reduce((acc: any, p: any) => {
          acc[p.status] = (acc[p.status] || 0) + 1
          return acc
        }, {})

        const donations = donationsRes.data || []
        const donationsTotal = donations
          .filter((d: any) => d.status === 'Completed')
          .reduce((sum: number, d: any) => sum + parseFloat(d.amount.toString()), 0)

        setStats({
          users: usersRes.count || 0,
          pending: statusCounts.received || 0,
          approved: statusCounts.prayed || 0,
          rejected: statusCounts['followed up'] || 0,
          sermons: sermonsRes.count || 0,
          events: eventsRes.count || 0,
          blogPosts: blogRes.count || 0,
          donations: donations.length,
          donationsTotal,
          volunteers: volunteersRes.count || 0,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [router])

  return (
    <AdminLayout isLoading={isLoading} skeleton={<DashboardPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-50 mb-8">{t('dashboard.overview')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('dashboard.totalUsers')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.users}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.dashboard.receivedPrayers')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.pending}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('dashboard.sermons')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.sermons}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('dashboard.events')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.events}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.dashboard.blogPosts')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.blogPosts}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('dashboard.donations')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.donations}</div>
            <div className="text-sm text-slate-300 mt-1">${stats.donationsTotal.toFixed(2)} {t('admin.dashboard.total')}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.dashboard.volunteers')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.volunteers}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.dashboard.prayedFor')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.approved}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.dashboard.followedUp')}</div>
            <div className="text-3xl font-bold text-slate-50">{stats.rejected}</div>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-slate-50 mb-6">{t('admin.dashboard.adminActions')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/prayers">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.prayerModeration')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.prayerModerationDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/sermons">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.sermonManager')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.sermonManagerDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/events">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.eventManager')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.eventManagerDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/blog">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.blogManager')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.blogManagerDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/donations">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.donations')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.donationsDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/events/reports">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.eventReports')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.eventReportsDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/volunteers">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.volunteers')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.volunteersDesc')}</p>
            </Card>
          </Link>
          <Link href="/live">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.liveSermons')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.liveSermonsDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/gamification">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.gamification')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.gamificationDesc')}</p>
            </Card>
          </Link>
          <Link href="/admin/content">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-900/80 border border-white/10 hover:border-amber-400/60">
              <h3 className="text-lg font-bold text-amber-200/90 mb-2">{t('admin.dashboard.contentManager')}</h3>
              <p className="text-sm text-slate-300">{t('admin.dashboard.contentManagerDesc')}</p>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}

