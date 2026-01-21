'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { VolunteersPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
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

      loadVolunteers()
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    let filtered = volunteers

    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.phone && v.phone.includes(searchTerm))
      )
    }

    if (filterDepartment) {
      filtered = filtered.filter(v => v.department === filterDepartment)
    }

    if (filterStatus) {
      filtered = filtered.filter(v => v.status === filterStatus)
    }

    setFilteredVolunteers(filtered)
  }, [volunteers, searchTerm, filterDepartment, filterStatus])

  async function loadVolunteers() {
    try {
      const params = new URLSearchParams()
      if (filterDepartment) params.append('department', filterDepartment)
      if (filterStatus) params.append('status', filterStatus)

      const response = await fetch(`/api/volunteers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setVolunteers(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load volunteers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(volunteerId: string, newStatus: string, notes?: string) {
    try {
      const response = await fetch(`/api/volunteers/${volunteerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      const data = await response.json()

      if (data.success) {
        loadVolunteers()
        setEditingNotes({ ...editingNotes, [volunteerId]: '' })
      } else {
        alert(data.error || t('admin.volunteers.updateFailed'))
      }
    } catch (err: any) {
      alert(err.message || t('admin.volunteers.updateFailed'))
    }
  }

  async function updateNotes(volunteerId: string) {
    const notes = editingNotes[volunteerId]
    if (notes !== undefined) {
      await updateStatus(volunteerId, volunteers.find(v => v.volunteer_id === volunteerId)?.status || 'Pending', notes)
    }
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<VolunteersPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900/80 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-50">{t('admin.volunteers.title')}</h2>
            <div className="text-sm text-slate-300">
              {t('admin.volunteers.total')}: {volunteers.length} | {t('admin.volunteers.showing')}: {filteredVolunteers.length}
            </div>
          </div>

          <div className="mb-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.volunteers.search')}</label>
              <input
                type="text"
                placeholder={t('admin.volunteers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.volunteers.department')}</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="" className="bg-slate-900">{t('admin.volunteers.allDepartments')}</option>
                <option value="Prayer" className="bg-slate-900">{t('volunteer.page.departments.prayer')}</option>
                <option value="Media" className="bg-slate-900">{t('volunteer.page.departments.media')}</option>
                <option value="Events" className="bg-slate-900">{t('volunteer.page.departments.events')}</option>
                <option value="Teaching" className="bg-slate-900">{t('volunteer.page.departments.teaching')}</option>
                <option value="Administration" className="bg-slate-900">{t('volunteer.page.departments.administration')}</option>
                <option value="Outreach" className="bg-slate-900">{t('volunteer.page.departments.outreach')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.volunteers.status')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="" className="bg-slate-900">{t('admin.volunteers.allStatuses')}</option>
                <option value="Pending" className="bg-slate-900">{t('admin.volunteers.pending')}</option>
                <option value="Active" className="bg-slate-900">{t('admin.volunteers.active')}</option>
                <option value="Inactive" className="bg-slate-900">{t('admin.volunteers.inactive')}</option>
                <option value="Rejected" className="bg-slate-900">{t('admin.volunteers.rejected')}</option>
              </select>
            </div>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="text-slate-400">{t('admin.volunteers.noApplicationsFound')}</div>
          ) : (
            <div className="space-y-4">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-50">{volunteer.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          volunteer.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                          volunteer.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                          volunteer.status === 'Inactive' ? 'bg-gray-500/20 text-gray-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {volunteer.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        <div>📧 {volunteer.email}</div>
                        {volunteer.phone && <div>📞 {volunteer.phone}</div>}
                        <div>🏢 Department: {volunteer.department}</div>
                        {volunteer.skills && volunteer.skills.length > 0 && (
                          <div>{t('admin.volunteers.skills')}: {volunteer.skills.join(', ')}</div>
                        )}
                        {volunteer.availability && (
                          <div>{t('admin.volunteers.availability')}: {volunteer.availability}</div>
                        )}
                        <div>📅 {t('admin.volunteers.applied')} {format(new Date(volunteer.created_at), 'PP')}</div>
                        {volunteer.notes && (
                          <div className="mt-2 p-2 bg-slate-800/50 rounded text-slate-200 border border-white/10">
                            <strong>{t('admin.volunteers.notes')}:</strong> {volunteer.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <select
                        value={volunteer.status}
                        onChange={(e) => updateStatus(volunteer.volunteer_id, e.target.value)}
                        className="px-3 py-1 border border-white/10 rounded text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      >
                        <option value="Pending" className="bg-slate-900">{t('admin.volunteers.pending')}</option>
                        <option value="Active" className="bg-slate-900">{t('admin.volunteers.active')}</option>
                        <option value="Inactive" className="bg-slate-900">{t('admin.volunteers.inactive')}</option>
                        <option value="Rejected" className="bg-slate-900">{t('admin.volunteers.rejected')}</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('admin.volunteers.addNotes')}
                          value={editingNotes[volunteer.volunteer_id] || volunteer.notes || ''}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [volunteer.volunteer_id]: e.target.value })}
                          className="px-2 py-1 border border-white/10 rounded text-xs w-32 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        />
                        <button
                          onClick={() => updateNotes(volunteer.volunteer_id)}
                          className="px-2 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors"
                        >
                          {t('admin.volunteers.save')}
                        </button>
                      </div>
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

