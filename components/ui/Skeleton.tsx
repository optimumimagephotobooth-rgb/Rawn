'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50 rounded'
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

// Dashboard Stats Card Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
      <Skeleton variant="text" width="60%" height={14} className="mb-3" />
      <Skeleton variant="text" width="40%" height={32} />
    </div>
  )
}

// Card Skeleton for list items (sermons, events, blog posts)
export function CardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <Skeleton variant="rectangular" height={224} className="w-full" />
      
      <div className="p-6 space-y-4">
        {/* Category badge skeleton */}
        <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" width="90%" height={24} />
          <Skeleton variant="text" width="70%" height={24} />
        </div>
        
        {/* Meta info skeletons */}
        <div className="space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={14} />
          <Skeleton variant="text" width="95%" height={14} />
          <Skeleton variant="text" width="85%" height={14} />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
          <Skeleton variant="rectangular" width={70} height={24} className="rounded-full" />
        </div>
      </div>
    </div>
  )
}

// List skeleton for multiple cards
export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Dashboard stats grid skeleton
export function DashboardStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 9 }).map((_, i) => (
        <DashboardStatsSkeleton key={i} />
      ))}
    </div>
  )
}

// Generic page skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="60%" height={20} />
      </div>
      
      {/* Content skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Dashboard page skeleton
export function DashboardPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <Skeleton variant="text" width="30%" height={32} className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 9 }).map((_, i) => (
          <DashboardStatsSkeleton key={i} />
        ))}
      </div>
      <Skeleton variant="text" width="25%" height={28} className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
            <Skeleton variant="text" width="70%" height={20} className="mb-2" />
            <Skeleton variant="text" width="90%" height={16} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Gamification page skeleton
export function GamificationPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <Skeleton variant="text" width="25%" height={32} className="mb-8" />
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-12 p-6">
        <div className="overflow-x-auto">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-white/5 pb-3">
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width={80} height={24} />
                <Skeleton variant="text" width={100} height={24} />
                <Skeleton variant="text" width="20%" height={8} className="self-center" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Skeleton variant="text" width="35%" height={32} className="mb-8" />
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-12 p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-white/5 pb-3">
              <Skeleton variant="text" width={40} height={24} />
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="text" width={120} height={24} />
            </div>
          ))}
        </div>
      </div>
      <Skeleton variant="text" width="25%" height={32} className="mb-8" />
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-12 p-6 space-y-4">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="50%" height={20} />
      </div>
      <Skeleton variant="text" width="30%" height={32} className="mb-8" />
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-12 p-6">
        <Skeleton variant="text" width="60%" height={20} />
      </div>
      <Skeleton variant="text" width="25%" height={32} className="mb-8" />
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <Skeleton variant="text" width="50%" height={20} />
      </div>
    </div>
  )
}

// Prayers page skeleton
export function PrayersPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Skeleton variant="text" width="40%" height={32} className="mb-2" />
        <Skeleton variant="text" width="60%" height={20} />
      </div>
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={120} height={36} className="rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
            <div className="flex gap-2 mb-3">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="rectangular" width={90} height={24} className="rounded" />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
            </div>
            <Skeleton variant="text" width="40%" height={16} className="mb-2" />
            <Skeleton variant="text" width="50%" height={16} className="mb-4" />
            <div className="bg-slate-950/50 rounded-lg p-3 mb-4">
              <Skeleton variant="text" width="100%" height={14} className="mb-2" />
              <Skeleton variant="text" width="95%" height={14} className="mb-2" />
              <Skeleton variant="text" width="85%" height={14} />
            </div>
            <Skeleton variant="rectangular" width={180} height={36} className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Sermons/Events/Blog form page skeleton
export function FormPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-8 p-6">
        <Skeleton variant="text" width="30%" height={32} className="mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={40} className="rounded-lg" />
          ))}
          <div className="flex gap-3">
            <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
            <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
          </div>
        </div>
      </div>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <Skeleton variant="text" width="25%" height={32} className="mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <Skeleton variant="text" width="50%" height={24} className="mb-2" />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Donations page skeleton
export function DonationsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Skeleton variant="text" width="35%" height={32} />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" width={140} height={40} className="rounded-lg" />
          <Skeleton variant="rectangular" width={140} height={40} className="rounded-lg" />
          <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <DashboardStatsSkeleton key={i} />
        ))}
      </div>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <Skeleton variant="text" width="25%" height={28} className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
                  </div>
                  <Skeleton variant="text" width="40%" height={16} className="mb-1" />
                  <Skeleton variant="text" width="50%" height={16} />
                </div>
                <Skeleton variant="text" width={100} height={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Volunteers page skeleton
export function VolunteersPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="text" width="40%" height={16} className="mb-1" />
              <Skeleton variant="rectangular" width="100%" height={40} className="rounded-md" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Skeleton variant="text" width={150} height={20} />
                    <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="50%" height={16} />
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="45%" height={16} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Skeleton variant="rectangular" width={120} height={32} className="rounded" />
                  <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={100} height={28} className="rounded" />
                    <Skeleton variant="rectangular" width={60} height={28} className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Content management page skeleton
export function ContentPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
      </div>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg mb-8 p-6">
        <Skeleton variant="text" width="25%" height={28} className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="text" width="20%" height={16} className="mb-2" />
              <Skeleton variant="rectangular" width="100%" height={40} className="rounded-lg" />
            </div>
          ))}
          <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
        </div>
      </div>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <Skeleton variant="text" width="25%" height={28} className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <Skeleton variant="text" width="40%" height={20} className="mb-2" />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Event reports page skeleton
export function EventReportsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Skeleton variant="text" width="35%" height={32} />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" width={140} height={40} className="rounded-lg" />
          <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <DashboardStatsSkeleton key={i} />
        ))}
      </div>
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <div className="overflow-x-auto">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-white/5 pb-3">
                <Skeleton variant="text" width="25%" height={20} />
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={100} height={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Memberships page skeleton (similar to volunteers)
export function MembershipsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="text" width="40%" height={16} className="mb-1" />
              <Skeleton variant="rectangular" width="100%" height={40} className="rounded-md" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Skeleton variant="text" width={150} height={20} />
                    <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="50%" height={16} />
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="45%" height={16} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Skeleton variant="rectangular" width={120} height={32} className="rounded" />
                  <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={100} height={28} className="rounded" />
                    <Skeleton variant="rectangular" width={60} height={28} className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
