import Link from 'next/link'
import BusinessConfig from '@/components/BusinessConfig'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
      <BusinessConfig />
    </div>
  )
}
