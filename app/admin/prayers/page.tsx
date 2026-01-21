'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { PrayersPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

interface Prayer {
  id: string
  prayer_id: string
  name: string | null
  email: string | null
  content: string
  status: 'received' | 'prayed' | 'followed up'
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export default function AdminPrayersPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'prayed' | 'followed up'>('all')
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

      loadPrayers()
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function loadPrayers() {
    try {
      setIsLoading(true)
      const url = statusFilter === 'all' 
        ? '/api/prayers' 
        : `/api/prayers?status=${statusFilter}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPrayers(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load prayers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (statusFilter !== undefined) {
      loadPrayers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function updateStatus(prayerId: string, status: string) {
    try {
      const response = await fetch(`/api/prayers/${prayerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        loadPrayers()
      } else {
        alert(data.error || 'Failed to update prayer')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update prayer')
    }
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<PrayersPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">{t('admin.prayers.title')}</h2>
            <p className="text-slate-300/90">{t('admin.prayers.subtitle')}</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('admin.prayers.allRequests')}
          </button>
          <button
            onClick={() => setStatusFilter('received')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'received'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('admin.prayers.received')}
          </button>
          <button
            onClick={() => setStatusFilter('prayed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'prayed'
                ? 'bg-green-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('admin.prayers.prayed')}
          </button>
          <button
            onClick={() => setStatusFilter('followed up')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'followed up'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('admin.prayers.followedUp')}
          </button>
        </div>

        {prayers.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {statusFilter === 'all' 
              ? t('admin.prayers.noPrayersFound')
              : t('admin.prayers.noPrayersFoundFiltered').replace('{status}', statusFilter)
            }
          </div>
        ) : (
          <div className="space-y-4">
            {prayers.map((prayer) => (
              <Card key={prayer.id} className="bg-slate-900/80 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm text-slate-400">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-slate-200">
                        {prayer.is_anonymous ? t('admin.prayers.anonymous') : prayer.name || t('admin.prayers.anonymous')}
                      </strong>
                      {prayer.is_anonymous && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded">
                          {t('admin.prayers.confidential')}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                        prayer.status === 'received' 
                          ? 'bg-blue-500/20 text-blue-300'
                          : prayer.status === 'prayed'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {prayer.status === 'received' ? t('admin.prayers.received') : 
                         prayer.status === 'prayed' ? t('admin.prayers.prayed') : t('admin.prayers.followedUp')}
                      </span>
                    </div>
                    {!prayer.is_anonymous && prayer.email && (
                      <div className="text-slate-500">{prayer.email}</div>
                    )}
                    <div className="text-slate-500 mt-1">
                      {t('admin.prayers.submitted')}: {format(new Date(prayer.created_at), 'PPpp')}
                      {prayer.updated_at !== prayer.created_at && (
                        <> • {t('admin.prayers.updated')}: {format(new Date(prayer.updated_at), 'PPpp')}</>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-slate-300 whitespace-pre-wrap mb-4 p-3 bg-slate-950/50 rounded-lg">
                  {prayer.content}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={prayer.status}
                    onChange={(e) => updateStatus(prayer.prayer_id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-white/10 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-transparent"
                  >
                    <option value="received">{t('admin.prayers.markAsReceived')}</option>
                    <option value="prayed">{t('admin.prayers.markAsPrayed')}</option>
                    <option value="followed up">{t('admin.prayers.markAsFollowedUp')}</option>
                  </select>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

