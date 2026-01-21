'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdminLayout } from '@/components/AdminLayout'
import { ContentPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

interface ContentPage {
  id: string
  slug: string
  title: string
  content: string
  meta_description: string
  status: 'draft' | 'published'
  updated_at: string
}

export default function ContentManagementPage() {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published',
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

      loadPages()
    }

    checkAuth()
  }, [router])

  async function loadPages() {
    try {
      // In a real implementation, you'd have a content_pages table
      // For now, we'll use a simple approach with localStorage or a JSON file
      // This is a placeholder that shows the structure
      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load pages:', err)
      setIsLoading(false)
    }
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault()
    // Implementation would save to database
    alert('Content management system - database integration needed')
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<ContentPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-50">{t('admin.content.title')}</h2>
          <Button onClick={() => setEditingPage(null)} variant="primary">
            {t('admin.content.newPage')}
          </Button>
        </div>

        <Card className="bg-slate-900/80 border border-white/10 mb-8">
          <h3 className="text-xl font-bold text-slate-50 mb-4">
            {editingPage ? t('admin.content.editPage') : t('admin.content.createNewPage')}
          </h3>
          <form onSubmit={savePage} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">{t('admin.content.slug')}</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={t('admin.content.slugPlaceholder')}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">{t('admin.content.pageTitle')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('admin.content.titlePlaceholder')}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">{t('admin.content.metaDescription')}</label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder={t('admin.content.metaDescriptionPlaceholder')}
                rows={2}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">{t('admin.content.content')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t('admin.content.contentPlaceholder')}
                rows={10}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">{t('admin.content.status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg"
              >
                <option value="draft">{t('admin.content.draft')}</option>
                <option value="published">{t('admin.content.published')}</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary">{t('admin.content.savePage')}</Button>
              {editingPage && (
                <Button type="button" onClick={() => setEditingPage(null)} variant="secondary">
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10">
          <h3 className="text-xl font-bold text-slate-50 mb-4">{t('admin.content.allPages')}</h3>
          {pages.length === 0 ? (
            <div className="text-slate-400 text-center py-12">
              {t('admin.content.noPagesYet')}
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex justify-between items-center p-4 border border-white/5 rounded-lg hover:bg-slate-800/50"
                >
                  <div>
                    <h4 className="font-semibold text-slate-200">{page.title}</h4>
                    <p className="text-sm text-slate-400">/{page.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      page.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {page.status}
                    </span>
                    <Button onClick={() => setEditingPage(page)} variant="secondary" className="text-sm">
                      {t('admin.content.edit')}
                    </Button>
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
