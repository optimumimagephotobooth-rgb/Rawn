'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function TeacherPage() {
  const [user, setUser] = useState<{ email: string; churchId: string | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

      if (!userData || userData.role !== 'Teacher' || userData.status !== 'Active') {
        router.push('/')
        return
      }

      setUser({
        email: userData.email,
        churchId: userData.church_id,
      })
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center text-slate-50">Loading...</div>
  }

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="bg-slate-900/80 border-b border-white/10 text-slate-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <strong className="text-lg">RAWN Ministry — Teacher Portal</strong>
          <nav className="flex gap-4">
            <Link href="/teacher" className="hover:text-amber-200 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-amber-200 transition-colors">Logout</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">Welcome, Teacher</h2>
        <p className="text-slate-300/90 mb-8">
          Guide, support, and encourage students in the RAWN Ministry community.
        </p>

        <Card className="mb-6 bg-slate-900/80 border border-white/10">
          <h3 className="text-lg font-bold text-slate-50 mb-4">Your Account</h3>
          <p className="mb-2 text-slate-300">
            <strong className="text-slate-200">Email:</strong> {user?.email}
          </p>
          <p className="mb-2 text-slate-300">
            <strong className="text-slate-200">Role:</strong> Teacher
          </p>
          <p className="text-slate-300">
            <strong className="text-slate-200">Church ID:</strong> {user?.churchId || '—'}
          </p>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10">
          <h3 className="text-lg font-bold text-slate-50 mb-4">Teacher Tools</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mb-4">
            <li>Encourage students to submit prayer requests</li>
            <li>Support approved prayer initiatives</li>
            <li>Guide learners through sermons and programs</li>
            <li>Promote engagement (XP is handled automatically)</li>
          </ul>
          <p className="text-sm text-slate-400">
            This portal is intentionally lightweight — all moderation and XP logic is handled
            securely by administrators and the backend.
          </p>
        </Card>
      </main>
    </div>
  )
}

