'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'Admin' | 'Teacher' | 'Student'
  requireChurch?: boolean
}

export function AuthGuard({ children, requiredRole, requireChurch = true }: AuthGuardProps) {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check user role and church
      const { data: userDataRaw } = await supabase
        .from('users')
        .select('role, church_id, status')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as {
        role: 'Admin' | 'Editor' | 'Media Team' | 'Teacher' | 'Student'
        church_id: string | null
        status: 'Active' | 'Inactive' | 'Suspended'
      } | null

      if (!userData || userData.status !== 'Active') {
        router.push('/login')
        return
      }

      if (requireChurch && !userData.church_id) {
        router.push('/onboarding')
        return
      }

      if (requiredRole && userData.role !== requiredRole) {
        router.push('/')
        return
      }
    }

    checkAuth()
  }, [router, requiredRole, requireChurch])

  return <>{children}</>
}

