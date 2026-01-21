'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { EventReportsPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

interface EventReport {
  event_id: string
  title: string
  event_date: string
  status: string
  registration_required: boolean
  capacity: number | null
  registered_count: number
  attended_count: number
  cancelled_count: number
  no_show_count: number
  attendance_rate: number
  revenue: number
  currency: string
}

export default function EventReportsPage() {
  const [reports, setReports] = useState<EventReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week' | 'year'>('all')
  const [summary, setSummary] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    averageAttendanceRate: 0,
    totalRevenue: 0,
  })
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userDataRaw } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as { role: string } | null

      if (!userData || !['Admin', 'Editor'].includes(userData.role)) {
        router.push('/')
        return
      }

      loadReports()
    }

    checkAuth()
  }, [router, dateRange])

  async function loadReports() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/events/reports?range=${dateRange}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.reports || [])
        setSummary(data.summary || summary)
      }
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function exportToCSV() {
    const headers = ['Event', 'Date', 'Status', 'Registrations', 'Attended', 'Cancelled', 'No-Show', 'Attendance Rate', 'Revenue']
    const rows = reports.map(r => [
      r.title,
      format(parseISO(r.event_date), 'yyyy-MM-dd'),
      r.status,
      r.registered_count,
      r.attended_count,
      r.cancelled_count,
      r.no_show_count,
      `${(r.attendance_rate * 100).toFixed(1)}%`,
      `${r.currency} ${r.revenue.toFixed(2)}`,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `event-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<EventReportsPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-50">{t('admin.eventReports.title')}</h2>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 bg-slate-800 border border-white/10 text-slate-200 rounded-lg"
            >
              <option value="all">{t('admin.eventReports.allTime')}</option>
              <option value="week">{t('admin.eventReports.lastWeek')}</option>
              <option value="month">{t('admin.eventReports.thisMonth')}</option>
              <option value="year">{t('admin.eventReports.thisYear')}</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-medium transition-colors"
            >
              {t('admin.eventReports.exportCsv')}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.eventReports.totalEvents')}</div>
            <div className="text-3xl font-bold text-slate-50">{summary.totalEvents}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.eventReports.totalRegistrations')}</div>
            <div className="text-3xl font-bold text-slate-50">{summary.totalRegistrations}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.eventReports.totalAttended')}</div>
            <div className="text-3xl font-bold text-slate-50">{summary.totalAttended}</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.eventReports.avgAttendance')}</div>
            <div className="text-3xl font-bold text-slate-50">{(summary.averageAttendanceRate * 100).toFixed(1)}%</div>
          </Card>
          <Card className="bg-slate-900/80 border border-white/10">
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.eventReports.totalRevenue')}</div>
            <div className="text-3xl font-bold text-slate-50">${summary.totalRevenue.toFixed(2)}</div>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="bg-slate-900/80 border border-white/10">
          <h3 className="text-xl font-bold text-slate-50 mb-4">{t('admin.eventReports.eventDetails')}</h3>
          {reports.length === 0 ? (
            <div className="text-slate-400 text-center py-12">{t('admin.eventReports.noEventsFound')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.event')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.date')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.status')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.registrations')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.attended')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.cancelled')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.noShow')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.attendanceRate')}</th>
                    <th className="px-4 py-3 text-slate-300 font-semibold">{t('admin.eventReports.revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.event_id} className="border-b border-white/5 hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-slate-200">
                        <Link href={`/admin/events/${report.event_id}`} className="hover:text-amber-400 transition-colors">
                          {report.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {format(parseISO(report.event_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          report.status === 'Published' ? 'bg-green-500/20 text-green-300' :
                          report.status === 'Completed' ? 'bg-blue-500/20 text-blue-300' :
                          report.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {report.status === 'Published' ? t('admin.events.published') :
                           report.status === 'Completed' ? t('admin.events.completed') :
                           report.status === 'Cancelled' ? t('admin.events.cancelled') :
                           report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{report.registered_count}</td>
                      <td className="px-4 py-3 text-green-300">{report.attended_count}</td>
                      <td className="px-4 py-3 text-red-300">{report.cancelled_count}</td>
                      <td className="px-4 py-3 text-yellow-300">{report.no_show_count}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-amber-400 h-2 rounded-full"
                              style={{ width: `${report.attendance_rate * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{(report.attendance_rate * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200 font-medium">
                        {report.currency} {report.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
