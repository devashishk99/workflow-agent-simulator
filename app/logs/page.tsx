import Link from 'next/link'
import LogsDashboard from '@/components/LogsDashboard'

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
      <LogsDashboard />
    </div>
  )
}
