'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { DonationsPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([])
  const [summary, setSummary] = useState({ total: 0, completed: 0, count: 0, pending: 0, failed: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

      const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student' } | null

      if (!userData || userData.role !== 'Admin') {
        router.push('/')
        return
      }

      loadDonations()
    }

    checkAuth()
  }, [router])

  async function loadDonations() {
    try {
      const params = new URLSearchParams()
      if (dateRange !== 'all') params.append('range', dateRange)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/admin/donations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setDonations(data.data || [])
        setSummary(data.summary || { total: 0, completed: 0, count: 0, pending: 0, failed: 0 })
      }
    } catch (err) {
      console.error('Failed to load donations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (dateRange || statusFilter) {
      loadDonations()
    }
  }, [dateRange, statusFilter])

  function exportToCSV() {
    const headers = ['Date', 'Donor Name', 'Email', 'Amount', 'Currency', 'Payment Method', 'Status', 'Recurring']
    const rows = donations.map(d => [
      format(new Date(d.created_at), 'yyyy-MM-dd HH:mm:ss'),
      d.donor_name || 'Anonymous',
      d.donor_email,
      d.amount,
      d.currency,
      d.payment_method,
      d.status,
      d.is_recurring ? 'Yes' : 'No',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<DonationsPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-50">{t('admin.donations.title')}</h2>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-white/10 rounded-lg bg-slate-900/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all" className="bg-slate-900">{t('admin.donations.allTime')}</option>
              <option value="week" className="bg-slate-900">{t('admin.donations.lastWeek')}</option>
              <option value="month" className="bg-slate-900">{t('admin.donations.thisMonth')}</option>
              <option value="year" className="bg-slate-900">{t('admin.donations.thisYear')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-white/10 rounded-lg bg-slate-900/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all" className="bg-slate-900">{t('admin.donations.allStatus')}</option>
              <option value="Completed" className="bg-slate-900">{t('admin.donations.completed')}</option>
              <option value="Pending" className="bg-slate-900">{t('admin.donations.pending')}</option>
              <option value="Failed" className="bg-slate-900">{t('admin.donations.failed')}</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('admin.donations.exportCsv')}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.donations.totalDonations')}</div>
              <div className="text-2xl font-bold text-slate-50">{summary.count}</div>
            </Card>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.donations.totalAmount')}</div>
              <div className="text-2xl font-bold text-slate-50">${summary.total.toFixed(2)}</div>
            </Card>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.donations.completed')}</div>
              <div className="text-2xl font-bold text-green-400">${summary.completed.toFixed(2)}</div>
            </Card>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.donations.pending')}</div>
              <div className="text-2xl font-bold text-amber-500">${summary.pending.toFixed(2)}</div>
            </Card>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">{t('admin.donations.failed')}</div>
              <div className="text-2xl font-bold text-red-400">${summary.failed.toFixed(2)}</div>
            </Card>
          </div>
        </div>

        <Card className="bg-slate-900/80 border border-white/10">
          <h2 className="text-xl font-bold text-slate-50 mb-4">{t('admin.donations.allDonations')}</h2>
          {donations.length === 0 ? (
            <div className="text-slate-400">{t('admin.donations.noDonationsYet')}</div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-50">
                          {donation.donor_name || t('admin.donations.anonymous')}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          donation.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                          donation.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {donation.status === 'Completed' ? t('admin.donations.completed') :
                           donation.status === 'Pending' ? t('admin.donations.pending') :
                           t('admin.donations.failed')}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300">
                        <div>{donation.donor_email}</div>
                        <div>{format(new Date(donation.created_at), 'PPp')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-50">
                        {donation.currency} {parseFloat(donation.amount.toString()).toFixed(2)}
                      </div>
                      {donation.is_recurring && (
                        <div className="text-xs text-slate-400">{t('admin.donations.recurring')}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

