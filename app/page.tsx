import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Workflow Agent Simulator</h1>
          <p className="text-lg text-slate-600">
            A deterministic workflow engine that simulates an AI agent implementation platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/admin" 
            className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Admin</h2>
            <p className="text-slate-600 text-sm">Configure business hours and services</p>
          </Link>
          
          <Link 
            href="/inbox" 
            className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Inbox</h2>
            <p className="text-slate-600 text-sm">Simulate customer messages</p>
          </Link>
          
          <Link 
            href="/logs" 
            className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Logs</h2>
            <p className="text-slate-600 text-sm">View workflow execution logs</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
