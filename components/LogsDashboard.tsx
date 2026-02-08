'use client'

import { useState, useEffect } from 'react'

type WorkflowRun = {
  id: string
  status: 'success' | 'failed' | 'partial'
  createdAt: string
  message: {
    channel: string
    rawMessage: string
    createdAt: string
  }
  context: {
    intent?: string
    customerName?: string
    requestedService?: string
    responseMessage?: string
  }
}

type LogEvent = {
  id: string
  timestamp: string
  eventType: string
  severity: string
  message: string
  metadata: any
}

type Metrics = {
  total: number
  success: number
  failed: number
  partial: number
  bookingSuccess: number
}

export default function LogsDashboard() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [runDetails, setRunDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRuns()
  }, [])

  const loadRuns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/runs')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load runs')
      }

      setRuns(data.runs)
      setMetrics(data.metrics)
    } catch (err: any) {
      setError(err.message || 'Failed to load workflow runs')
    } finally {
      setLoading(false)
    }
  }

  const loadRunDetails = async (runId: string) => {
    if (selectedRun === runId && runDetails) {
      return // Already loaded
    }

    try {
      setLoadingDetails(true)
      setSelectedRun(runId)
      const response = await fetch(`/api/runs/${runId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load run details')
      }

      setRunDetails(data.run)
    } catch (err: any) {
      setError(err.message || 'Failed to load run details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'failed':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'partial':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-800'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600 text-lg">Loading workflow runs...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Logs Dashboard</h1>
        <p className="text-slate-600">View workflow execution history and debug issues</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Total Runs</div>
            <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Success</div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.success}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Failed</div>
            <div className="text-2xl font-bold text-rose-600">{metrics.failed}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Partial</div>
            <div className="text-2xl font-bold text-amber-600">{metrics.partial}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Booking Success</div>
            <div className="text-2xl font-bold text-blue-600">{metrics.bookingSuccess}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Workflow Runs</h2>
            <p className="text-sm text-slate-500 mt-1">Click a run to view details</p>
          </div>
          <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
            {runs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No workflow runs yet. Process some messages in the Inbox to see logs here.
              </div>
            ) : (
              runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => loadRunDetails(run.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    selectedRun === run.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(run.status)}`}>
                          {run.status}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {run.message.channel}
                        </span>
                        {run.context.intent && (
                          <span className="text-xs text-slate-600">
                            {run.context.intent}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-900 mb-1 truncate">
                        {run.message.rawMessage}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateTime(run.createdAt)}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Run Details */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Run Details</h2>
            {selectedRun && (
              <p className="text-sm text-slate-500 mt-1">Viewing execution timeline</p>
            )}
          </div>
          <div className="p-6">
            {!selectedRun ? (
              <div className="text-center text-slate-500 py-12">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a workflow run to view details</p>
              </div>
            ) : loadingDetails ? (
              <div className="text-center text-slate-500 py-12">
                Loading details...
              </div>
            ) : runDetails ? (
              <div className="space-y-6">
                {/* Message Info */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Message</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">Channel:</span>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">{runDetails.message.channel}</span>
                    </div>
                    <div className="text-sm text-slate-900">{runDetails.message.rawMessage}</div>
                    <div className="text-xs text-slate-500">{formatDateTime(runDetails.message.createdAt)}</div>
                  </div>
                </div>

                {/* Context Info */}
                {runDetails.context && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Extracted Data</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                      {runDetails.context.intent && (
                        <div>
                          <span className="text-slate-600">Intent: </span>
                          <span className="font-medium text-slate-900">{runDetails.context.intent}</span>
                        </div>
                      )}
                      {runDetails.context.customerName && (
                        <div>
                          <span className="text-slate-600">Name: </span>
                          <span className="font-medium text-slate-900">{runDetails.context.customerName}</span>
                        </div>
                      )}
                      {runDetails.context.requestedService && (
                        <div>
                          <span className="text-slate-600">Service: </span>
                          <span className="font-medium text-slate-900">{runDetails.context.requestedService}</span>
                        </div>
                      )}
                      {runDetails.context.requestedDateTime && (
                        <div>
                          <span className="text-slate-600">DateTime: </span>
                          <span className="font-medium text-slate-900">
                            {formatDateTime(runDetails.context.requestedDateTime)}
                          </span>
                        </div>
                      )}
                      {runDetails.context.responseMessage && (
                        <div className="pt-2 border-t border-slate-200">
                          <div className="text-slate-600 mb-1">Response:</div>
                          <div className="text-slate-900 bg-white p-3 rounded border border-slate-200">
                            {runDetails.context.responseMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Log Events */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Execution Logs ({runDetails.logEvents?.length || 0} events)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {runDetails.logEvents?.map((event: LogEvent) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border text-sm ${getSeverityColor(event.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium">{event.eventType}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-75">{formatDateTime(event.timestamp)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              event.severity === 'error'
                                ? 'bg-rose-200 text-rose-900'
                                : event.severity === 'warning'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {event.severity}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs opacity-90 mb-1">{event.message}</div>
                        {event.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-slate-600 hover:text-slate-900">
                              View metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Failed to load run details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

