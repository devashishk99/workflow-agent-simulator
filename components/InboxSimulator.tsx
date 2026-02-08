'use client'

import { useState } from 'react'

type Channel = 'web' | 'email' | 'sms'

type WorkflowResult = {
  intent?: string
  customerName?: string
  requestedDateTime?: string
  requestedService?: string
  validationErrors: string[]
  responseMessage?: string
  actionsTaken: string[]
}

type LogEvent = {
  eventType: string
  severity: string
  message: string
  timestamp: string
}

const TEST_MESSAGES = [
  {
    label: 'Booking Request',
    channel: 'web' as Channel,
    message: "Hi, I'm Deva. Can I book a haircut tomorrow at 3pm?"
  },
  {
    label: 'Missing Service',
    channel: 'web' as Channel,
    message: "I'd like to book an appointment tomorrow at 3pm"
  },
  {
    label: 'Missing DateTime',
    channel: 'email' as Channel,
    message: "Can I book a haircut?"
  },
  {
    label: 'Outside Hours',
    channel: 'sms' as Channel,
    message: "I need a haircut tomorrow at 10pm"
  },
  {
    label: 'Angry Customer',
    channel: 'web' as Channel,
    message: "This is ridiculous. You never answer my messages. I'm very frustrated!"
  },
  {
    label: 'Cancellation',
    channel: 'email' as Channel,
    message: "I need to cancel my appointment for tomorrow"
  },
  {
    label: 'Info Request',
    channel: 'web' as Channel,
    message: "What are your opening hours?"
  }
]

export default function InboxSimulator() {
  const [channel, setChannel] = useState<Channel>('web')
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<WorkflowResult | null>(null)
  const [logEvents, setLogEvents] = useState<LogEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)
    setLogEvents([])

    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel,
          message: message.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process message')
      }

      setResult(data.result)
      setLogEvents(data.logEvents || [])
    } catch (err: any) {
      setError(err.message || 'Failed to process message')
    } finally {
      setProcessing(false)
    }
  }

  const handleTestMessage = (testMessage: typeof TEST_MESSAGES[0]) => {
    setChannel(testMessage.channel)
    setMessage(testMessage.message)
    setResult(null)
    setLogEvents([])
    setError(null)
  }

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return 'N/A'
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return dateTimeStr
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Inbox Simulator</h1>
        <p className="text-slate-600">Simulate incoming customer messages and see how the workflow processes them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Message Input</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as Channel)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
                >
                  <option value="web">Web</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter customer message..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={processing || !message.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  'Process Message'
                )}
              </button>
            </div>
          </div>

          {/* Test Messages */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Test Messages</h2>
            <p className="text-sm text-slate-500 mb-4">Click to try pre-built test scenarios</p>
            <div className="space-y-2">
              {TEST_MESSAGES.map((test, index) => (
                <button
                  key={index}
                  onClick={() => handleTestMessage(test)}
                  className="w-full text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium text-slate-700 border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span>{test.label}</span>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      {test.channel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {result && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Workflow Results</h2>
              
              <div className="space-y-4">
                {/* Response Message */}
                {result.responseMessage && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">Response</div>
                    <div className="text-blue-800">{result.responseMessage}</div>
                  </div>
                )}

                {/* Detected Intent */}
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Detected Intent</div>
                  <div className="px-3 py-2 bg-slate-100 rounded-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {result.intent || 'unknown'}
                    </span>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">Extracted Data</div>
                  <div className="space-y-2 text-sm">
                    {result.customerName && (
                      <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Name:</span>
                        <span className="font-medium text-slate-900">{result.customerName}</span>
                      </div>
                    )}
                    {result.requestedService && (
                      <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Service:</span>
                        <span className="font-medium text-slate-900">{result.requestedService}</span>
                      </div>
                    )}
                    {result.requestedDateTime && (
                      <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">DateTime:</span>
                        <span className="font-medium text-slate-900">{formatDateTime(result.requestedDateTime)}</span>
                      </div>
                    )}
                    {!result.customerName && !result.requestedService && !result.requestedDateTime && (
                      <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-500">
                        No data extracted
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Errors */}
                {result.validationErrors.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Validation Errors</div>
                    <div className="space-y-1">
                      {result.validationErrors.map((error, index) => (
                        <div key={index} className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Taken */}
                {result.actionsTaken.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Actions Taken</div>
                    <div className="space-y-1">
                      {result.actionsTaken.map((action, index) => (
                        <div key={index} className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Log Events */}
          {logEvents.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Execution Logs</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      event.severity === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : event.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{event.eventType}</div>
                        <div className="text-xs opacity-75">{event.message}</div>
                      </div>
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
                ))}
              </div>
            </div>
          )}

          {!result && !processing && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
              <div className="text-slate-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-slate-600">Process a message to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

