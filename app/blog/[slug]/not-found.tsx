import Link from 'next/link'
import { Card } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center px-4">
      <Card className="bg-slate-900/80 border border-white/10 text-center p-8 max-w-md">
        <h1 className="text-2xl font-semibold text-slate-50 mb-4">Post Not Found</h1>
        <p className="text-slate-300 mb-6">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/blog">
          <button className="px-6 py-2 bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 transition-colors font-medium">
            Back to Blog
          </button>
        </Link>
      </Card>
    </div>
  )
}
