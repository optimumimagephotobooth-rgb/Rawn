'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { Sermon } from '@/types/sermon'
import { FormPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    category: '',
    description: '',
    videoUrl: '',
    audioUrl: '',
    notesUrl: '',
    scriptureReferences: '',
    date: '',
  })
  const [message, setMessage] = useState<string | null>(null)
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

      const { data: userDataRaw, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student' } | null

      // If user doesn't exist in users table, redirect to onboarding
      if (userError || !userData) {
        console.warn('User not found in users table, redirecting to onboarding:', userError)
        router.push('/onboarding')
        return
      }

      if (userData.role !== 'Admin') {
        router.push('/')
        return
      }

      loadSermons()
    }

    checkAuth()
  }, [router])

  async function loadSermons() {
    try {
      const response = await fetch('/api/sermons')
      const data = await response.json()

      if (data.success) {
        setSermons(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load sermons:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveSermon(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage(t('admin.sermons.titleRequired'))
      return
    }

    try {
      const url = editingSermon
        ? `/api/sermons/${editingSermon.sermon_id}`
        : '/api/sermons'
      const method = editingSermon ? 'PATCH' : 'POST'

      // Parse scripture references (comma-separated string to array)
      const scriptureRefs = formData.scriptureReferences
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref.length > 0)

      const payload = {
        ...formData,
        scriptureReferences: scriptureRefs.length > 0 ? scriptureRefs : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(t('admin.sermons.savedSuccessfully'))
        resetForm()
        loadSermons()
      } else {
        // Handle onboarding requirement
        if (data.requiresOnboarding) {
          setMessage(t('admin.sermons.completeAccountSetup'))
          setTimeout(() => {
            router.push('/onboarding')
          }, 2000)
        } else {
          setMessage(data.error || t('admin.sermons.saveFailed'))
        }
      }
    } catch (err: any) {
      setMessage(err.message || t('admin.sermons.saveFailed'))
    }
  }

  function editSermon(sermon: Sermon) {
    setEditingSermon(sermon)
    setFormData({
      title: sermon.title,
      speaker: sermon.speaker || '',
      category: sermon.category || '',
      description: sermon.description || '',
      videoUrl: sermon.video_url || '',
      audioUrl: sermon.audio_url || '',
      notesUrl: sermon.notes_url || '',
      scriptureReferences: sermon.scripture_references?.join(', ') || '',
      date: sermon.date ? sermon.date.split('T')[0] : '',
    })
  }

  async function deleteSermon(sermonId: string) {
    if (!confirm(t('admin.sermons.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/sermons/${sermonId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        loadSermons()
      } else {
        alert(data.error || t('admin.sermons.deleteFailed'))
      }
    } catch (err: any) {
      alert(err.message || t('admin.sermons.deleteFailed'))
    }
  }

  function resetForm() {
    setEditingSermon(null)
    setFormData({
      title: '',
      speaker: '',
      category: '',
      description: '',
      videoUrl: '',
      audioUrl: '',
      notesUrl: '',
      scriptureReferences: '',
      date: '',
    })
    setMessage(null)
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<FormPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 bg-slate-900/80 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-50 mb-6">
            {editingSermon ? t('admin.sermons.editSermon') : t('admin.sermons.addNewSermon')}
          </h2>

          <form onSubmit={saveSermon} className="space-y-4">
            <input
              type="text"
              placeholder={t('admin.sermons.sermonTitle')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder={t('admin.sermons.speaker')}
              value={formData.speaker}
              onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            >
              <option value="">{t('admin.sermons.selectCategory')}</option>
              <option value="Prophetic">{t('admin.sermons.prophetic')}</option>
              <option value="Prayer">{t('admin.sermons.prayer')}</option>
              <option value="Discipleship">{t('admin.sermons.discipleship')}</option>
              <option value="Healing">{t('admin.sermons.healing')}</option>
              <option value="Leadership">{t('admin.sermons.leadership')}</option>
            </select>
            <textarea
              placeholder={t('admin.sermons.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              rows={4}
            />
            <input
              type="url"
              placeholder={t('admin.sermons.videoUrl')}
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />
            <input
              type="url"
              placeholder={t('admin.sermons.audioUrl')}
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />
            <input
              type="url"
              placeholder={t('admin.sermons.notesUrl')}
              value={formData.notesUrl}
              onChange={(e) => setFormData({ ...formData, notesUrl: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />
            <input
              type="text"
              placeholder={t('admin.sermons.scriptureReferences')}
              value={formData.scriptureReferences}
              onChange={(e) => setFormData({ ...formData, scriptureReferences: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
            />

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="primary">{t('admin.sermons.saveSermon')}</Button>
              {editingSermon && (
                <Button type="button" onClick={resetForm} variant="secondary">
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-50 mb-6">{t('admin.sermons.allSermons')}</h2>

          {sermons.length === 0 ? (
            <div className="text-slate-400">{t('admin.sermons.noSermonsYet')}</div>
          ) : (
            <div className="space-y-4">
              {sermons.map((sermon) => (
                <div key={sermon.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-50">{sermon.title}</h3>
                      <div className="text-sm text-slate-300 mt-1">
                        {sermon.speaker && <>{sermon.speaker}</>}
                        {sermon.category && <> · {sermon.category}</>}
                        {sermon.date && <> · {format(new Date(sermon.date), 'PP')}</>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => editSermon(sermon)}
                        variant="secondary"
                        className="text-sm"
                      >
                        {t('admin.sermons.edit')}
                      </Button>
                      <Button
                        onClick={() => deleteSermon(sermon.sermon_id)}
                        variant="danger"
                        className="text-sm"
                      >
                        {t('admin.sermons.delete')}
                      </Button>
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

