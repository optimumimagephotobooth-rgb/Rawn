'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function StudentPage() {
  const [user, setUser] = useState<{ email: string; churchId: string | null } | null>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userDataRaw } = await supabase
        .from('users')
        .select('email, church_id, role, status')
        .eq('id', authUser.id)
        .single()

      const userData = userDataRaw as {
        email: string
        church_id: string | null
        role: 'Admin' | 'Teacher' | 'Student'
        status: 'Active' | 'Inactive' | 'Suspended'
      } | null

      if (!userData || userData.role !== 'Student' || userData.status !== 'Active') {
        router.push('/')
        return
      }

      setUser({
        email: userData.email,
        churchId: userData.church_id,
      })
    }

    checkAuth()
  }, [router])

  async function submitPrayer(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      setMessage('Prayer request is required.')
      setIsSuccess(false)
      return
    }

    try {
      setIsLoading(true)
      setMessage('Submitting prayer…')

      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Submission failed')
      }

      setMessage('Thank you. Your prayer has been submitted for review.')
      setIsSuccess(true)
      setContent('')
      setName('')
    } catch (err: any) {
      setMessage(err.message || 'Submission failed.')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="bg-slate-900/80 border-b border-white/10 text-slate-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <strong className="text-lg">RAWN Ministry — Student Portal</strong>
          <nav className="flex gap-4">
            <Link href="/student" className="hover:text-amber-200 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-amber-200 transition-colors">Logout</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">Welcome</h2>
        <p className="text-slate-300/90 mb-8">
          Participate in the community and submit prayer requests.
        </p>

        <Card className="mb-6 bg-slate-900/80 border border-white/10">
          <h3 className="text-lg font-bold text-slate-50 mb-4">Your Account</h3>
          <p className="mb-2 text-slate-300">
            <strong className="text-slate-200">Email:</strong> {user?.email}
          </p>
          <p className="text-slate-300">
            <strong className="text-slate-200">Church ID:</strong> {user?.churchId || '—'}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            You earn XP by engaging — every prayer submission counts.
          </p>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10">
          <h3 className="text-lg font-bold text-slate-50 mb-4">Submit a Prayer Request</h3>

          <form onSubmit={submitPrayer} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-200 mb-2">
                Name (optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-200 mb-2">
                Prayer Request *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your prayer request here…"
                rows={6}
                className="w-full px-4 py-2 border border-white/10 bg-slate-950/80 text-slate-50 rounded-lg resize-y focus:ring-2 focus:ring-amber-400/50 focus:border-transparent placeholder:text-slate-500"
                disabled={isLoading}
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isSuccess
                    ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                    : 'bg-red-500/20 border border-red-500/50 text-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} variant="primary">
              Submit Prayer
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}

