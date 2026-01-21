'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import { AdminLayout } from '@/components/AdminLayout'
import { FormPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

interface BlogPost {
  id: string
  post_id: string
  title: string
  slug: string
  category: string | null
  status: string
  published_at: string | null
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'Draft',
    seoTitle: '',
    seoDescription: '',
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

      const { data: userDataRaw } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student' } | null

      if (!userData || (userData.role !== 'Admin' && userData.role !== 'Teacher')) {
        router.push('/')
        return
      }

      loadPosts()
    }

    checkAuth()
  }, [router])

  async function loadPosts() {
    try {
      const response = await fetch('/api/blog?status=Published')
      const data = await response.json()

      if (data.success) {
        setPosts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage(t('admin.blog.titleRequired'))
      return
    }

    if (!formData.content.trim()) {
      setMessage(t('admin.blog.contentRequired'))
      return
    }

    try {
      const url = editingPost
        ? `/api/blog/${editingPost.slug}`
        : '/api/blog'
      const method = editingPost ? 'PATCH' : 'POST'

      const body = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(t('admin.blog.savedSuccessfully'))
        resetForm()
        loadPosts()
      } else {
        setMessage(data.error || t('admin.blog.saveFailed'))
      }
    } catch (err: any) {
      setMessage(err.message || t('admin.blog.saveFailed'))
    }
  }

  function editPost(post: BlogPost) {
    // Load full post details
    fetch(`/api/blog/${post.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const fullPost = data.data
          setEditingPost(fullPost)
          setFormData({
            title: fullPost.title,
            slug: fullPost.slug,
            content: fullPost.content,
            excerpt: fullPost.excerpt || '',
            author: fullPost.author || '',
            category: fullPost.category || '',
            tags: (fullPost.tags || []).join(', '),
            featuredImage: fullPost.featured_image || '',
            status: fullPost.status,
            seoTitle: fullPost.seo_title || '',
            seoDescription: fullPost.seo_description || '',
          })
        }
      })
  }

  async function deletePost(slug: string) {
    if (!confirm(t('admin.blog.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        loadPosts()
      } else {
        alert(data.error || t('admin.blog.deleteFailed'))
      }
    } catch (err: any) {
      alert(err.message || t('admin.blog.deleteFailed'))
    }
  }

  function resetForm() {
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      tags: '',
      featuredImage: '',
      status: 'Draft',
      seoTitle: '',
      seoDescription: '',
    })
    setMessage(null)
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<FormPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 bg-slate-900/80 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-50 mb-6">
            {editingPost ? t('admin.blog.editPost') : t('admin.blog.addNewPost')}
          </h2>

          <form onSubmit={savePost} className="space-y-4">
            <input
              type="text"
              placeholder={t('admin.blog.postTitle')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              required
            />
            <input
              type="text"
              placeholder={t('admin.blog.slug')}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <textarea
              placeholder={t('admin.blog.content')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              rows={10}
              required
            />
            <textarea
              placeholder={t('admin.blog.excerpt')}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t('admin.blog.author')}
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="">{t('admin.blog.selectCategory')}</option>
                <option value="Prophetic">{t('admin.blog.prophetic')}</option>
                <option value="Devotional">{t('admin.blog.devotional')}</option>
                <option value="Teaching">{t('admin.blog.teaching')}</option>
                <option value="Announcement">{t('admin.blog.announcement')}</option>
              </select>
            </div>
            <input
              type="text"
              placeholder={t('admin.blog.tags')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <input
              type="url"
              placeholder={t('admin.blog.featuredImageUrl')}
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="Draft">{t('admin.blog.draft')}</option>
              <option value="Published">{t('admin.blog.published')}</option>
              <option value="Archived">{t('admin.blog.archived')}</option>
            </select>
            <input
              type="text"
              placeholder={t('admin.blog.seoTitle')}
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <textarea
              placeholder={t('admin.blog.seoDescription')}
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              rows={2}
            />

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') ? 'bg-green-900/50 text-green-200 border border-green-700/50' : 'bg-red-900/50 text-red-200 border border-red-700/50'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="primary">{t('admin.blog.savePost')}</Button>
              {editingPost && (
                <Button type="button" onClick={resetForm} variant="secondary">
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-50 mb-6">{t('admin.blog.allPosts')}</h2>

          {posts.length === 0 ? (
            <div className="text-slate-400">{t('admin.blog.noPostsYet')}</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-50">{post.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.status === 'Published' ? 'bg-green-900/50 text-green-200 border border-green-700/50' :
                          post.status === 'Draft' ? 'bg-slate-800 text-slate-300 border border-white/10' :
                          'bg-blue-900/50 text-blue-200 border border-blue-700/50'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300">
                        {post.category && <span>{post.category}</span>}
                        {post.published_at && (
                          <span className="ml-2">
                            {format(parseISO(post.published_at), 'PP')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="secondary" className="text-sm">{t('admin.blog.view')}</Button>
                      </Link>
                      <Button
                        onClick={() => editPost(post)}
                        variant="secondary"
                        className="text-sm"
                      >
                        {t('admin.blog.edit')}
                      </Button>
                      <Button
                        onClick={() => deletePost(post.slug)}
                        variant="danger"
                        className="text-sm"
                      >
                        {t('admin.blog.delete')}
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

