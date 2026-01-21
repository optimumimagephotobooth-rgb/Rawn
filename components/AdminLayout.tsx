'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { PageSkeleton } from './ui/Skeleton'

interface AdminLayoutProps {
  children: ReactNode
  isLoading?: boolean
  skeleton?: ReactNode
}

export function AdminLayout({ children, isLoading = false, skeleton }: AdminLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-72 py-12 px-6">
        {isLoading ? (skeleton || <PageSkeleton />) : children}
      </main>
    </div>
  )
}
