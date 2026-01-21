'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { MembershipsPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([])
  const [filteredMemberships, setFilteredMemberships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCommitment, setFilterCommitment] = useState('')
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

      loadMemberships()
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    let filtered = memberships

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm))
      )
    }

    if (filterStatus) {
      filtered = filtered.filter(m => m.status === filterStatus)
    }

    if (filterCommitment) {
      filtered = filtered.filter(m => m.commitment_level === filterCommitment)
    }

    setFilteredMemberships(filtered)
  }, [memberships, searchTerm, filterStatus, filterCommitment])

  async function loadMemberships() {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterCommitment) params.append('commitment_level', filterCommitment)

      const response = await fetch(`/api/membership?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setMemberships(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load memberships:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(membershipId: string, newStatus: string, notes?: string) {
    try {
      const response = await fetch(`/api/membership/${membershipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      const data = await response.json()

      if (data.success) {
        loadMemberships()
        setEditingNotes({ ...editingNotes, [membershipId]: '' })
      } else {
        alert(data.error || t('admin.memberships.updateFailed'))
      }
    } catch (err: any) {
      alert(err.message || t('admin.memberships.updateFailed'))
    }
  }

  async function updateNotes(membershipId: string) {
    const notes = editingNotes[membershipId]
    if (notes !== undefined) {
      await updateStatus(membershipId, memberships.find(m => m.membership_id === membershipId)?.status || 'Pending', notes)
    }
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<MembershipsPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900/80 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-50">{t('admin.memberships.title')}</h2>
            <div className="text-sm text-slate-300">
              {t('admin.memberships.total')}: {memberships.length} | {t('admin.memberships.showing')}: {filteredMemberships.length}
            </div>
          </div>

          <div className="mb-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.memberships.search')}</label>
              <input
                type="text"
                placeholder={t('admin.memberships.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.memberships.status')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="" className="bg-slate-900">{t('admin.memberships.allStatuses')}</option>
                <option value="Pending" className="bg-slate-900">{t('admin.memberships.pending')}</option>
                <option value="Active" className="bg-slate-900">{t('admin.memberships.active')}</option>
                <option value="Inactive" className="bg-slate-900">{t('admin.memberships.inactive')}</option>
                <option value="Rejected" className="bg-slate-900">{t('admin.memberships.rejected')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">{t('admin.memberships.commitmentLevel')}</label>
              <select
                value={filterCommitment}
                onChange={(e) => setFilterCommitment(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-md text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="" className="bg-slate-900">{t('admin.memberships.allLevels')}</option>
                <option value="Regular" className="bg-slate-900">{t('admin.memberships.regular')}</option>
                <option value="Associate" className="bg-slate-900">{t('admin.memberships.associate')}</option>
                <option value="Full" className="bg-slate-900">{t('admin.memberships.full')}</option>
              </select>
            </div>
          </div>

          {filteredMemberships.length === 0 ? (
            <div className="text-slate-400">{t('admin.memberships.noApplicationsFound')}</div>
          ) : (
            <div className="space-y-4">
              {filteredMemberships.map((membership) => (
                <div key={membership.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-50">{membership.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          membership.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                          membership.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                          membership.status === 'Inactive' ? 'bg-gray-500/20 text-gray-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {membership.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded font-semibold bg-blue-500/20 text-blue-300">
                          {membership.commitment_level}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        <div>📧 {membership.email}</div>
                        {membership.phone && <div>📞 {membership.phone}</div>}
                        {membership.address && (
                          <div>📍 {membership.address}{membership.city ? `, ${membership.city}` : ''}{membership.state ? `, ${membership.state}` : ''}</div>
                        )}
                        {membership.interests && membership.interests.length > 0 && (
                          <div>{t('admin.memberships.interests')}: {membership.interests.join(', ')}</div>
                        )}
                        {membership.how_did_you_hear && (
                          <div>{t('admin.memberships.heardAboutUs')}: {membership.how_did_you_hear}</div>
                        )}
                        <div>📅 {t('admin.memberships.applied')} {format(new Date(membership.created_at), 'PP')}</div>
                        {membership.notes && (
                          <div className="mt-2 p-2 bg-slate-800/50 rounded text-slate-200 border border-white/10">
                            <strong>{t('admin.memberships.notes')}:</strong> {membership.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <select
                        value={membership.status}
                        onChange={(e) => updateStatus(membership.membership_id, e.target.value)}
                        className="px-3 py-1 border border-white/10 rounded text-sm bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      >
                        <option value="Pending" className="bg-slate-900">{t('admin.memberships.pending')}</option>
                        <option value="Active" className="bg-slate-900">{t('admin.memberships.active')}</option>
                        <option value="Inactive" className="bg-slate-900">{t('admin.memberships.inactive')}</option>
                        <option value="Rejected" className="bg-slate-900">{t('admin.memberships.rejected')}</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('admin.memberships.addNotes')}
                          value={editingNotes[membership.membership_id] || membership.notes || ''}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [membership.membership_id]: e.target.value })}
                          className="px-2 py-1 border border-white/10 rounded text-xs w-32 bg-slate-950/80 text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                        />
                        <button
                          onClick={() => updateNotes(membership.membership_id)}
                          className="px-2 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors"
                        >
                          {t('admin.memberships.save')}
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
