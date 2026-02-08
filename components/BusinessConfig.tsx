'use client'

import { useState, useEffect } from 'react'

type Business = {
  id?: string
  name: string
  timezone?: string
}

type OpeningHour = {
  id?: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

type Service = {
  id?: string
  name: string
  duration: number
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
]

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC'
]

export default function BusinessConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [business, setBusiness] = useState<Business>({
    name: '',
    timezone: ''
  })

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: false
    }))
  )

  const [services, setServices] = useState<Service[]>([
    { name: '', duration: 30 }
  ])

  // Load existing configuration
  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/business')
      const data = await response.json()

      if (data.business) {
        setBusiness({
          id: data.business.id,
          name: data.business.name,
          timezone: data.business.timezone || ''
        })
      }

      if (data.openingHours && data.openingHours.length > 0) {
        const hoursMap = new Map<number, OpeningHour>(
          data.openingHours.map((oh: OpeningHour) => [oh.dayOfWeek, oh])
        )
        const merged: OpeningHour[] = DAYS_OF_WEEK.map((day): OpeningHour => {
          const existing: OpeningHour | undefined = hoursMap.get(day.value)
          if (existing) {
            return existing
          }
          return {
            dayOfWeek: day.value,
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: false
          }
        })
        setOpeningHours(merged)
      }

      if (data.services && data.services.length > 0) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error loading configuration:', error)
      setMessage({ type: 'error', text: 'Failed to load configuration' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      if (!business.name.trim()) {
        setMessage({ type: 'error', text: 'Business name is required' })
        setSaving(false)
        return
      }

      const validServices = services.filter(s => s.name.trim())
      if (validServices.length === 0) {
        setMessage({ type: 'error', text: 'At least one service is required' })
        setSaving(false)
        return
      }

      const response = await fetch('/api/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business: {
            name: business.name.trim(),
            timezone: business.timezone || null
          },
          openingHours: openingHours.map(oh => ({
            dayOfWeek: oh.dayOfWeek,
            openTime: oh.openTime,
            closeTime: oh.closeTime,
            isClosed: oh.isClosed
          })),
          services: validServices.map(s => ({
            name: s.name.trim(),
            duration: parseInt(s.duration.toString()) || 30
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setMessage({ type: 'success', text: 'Configuration saved successfully!' })
      
      if (data.business) {
        setBusiness(prev => ({ ...prev, id: data.business.id }))
      }
      if (data.openingHours) {
        setOpeningHours(data.openingHours)
      }
      if (data.services) {
        setServices(data.services)
      }
    } catch (error: any) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  const updateOpeningHour = (dayOfWeek: number, field: keyof OpeningHour, value: any) => {
    setOpeningHours(prev =>
      prev.map(oh =>
        oh.dayOfWeek === dayOfWeek
          ? { ...oh, [field]: value }
          : oh
      )
    )
  }

  const addService = () => {
    setServices(prev => [...prev, { name: '', duration: 30 }])
  }

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: keyof Service, value: any) => {
    setServices(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600 text-lg">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Configuration</h1>
        <p className="text-slate-600">Set up your business details, hours, and services</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Business Information */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Business Information</h2>
        <p className="text-sm text-slate-500 mb-6">Basic details about your business</p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => setBusiness(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              placeholder="Enter business name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={business.timezone || ''}
              onChange={(e) => setBusiness(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
            >
              <option value="">Select timezone (optional)</option>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Opening Hours</h2>
        <p className="text-sm text-slate-500 mb-6">Set your business hours for each day of the week</p>
        
        <div className="space-y-3">
          {openingHours.map(oh => {
            const dayLabel = DAYS_OF_WEEK.find(d => d.value === oh.dayOfWeek)?.label || ''
            return (
              <div 
                key={oh.dayOfWeek} 
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  oh.isClosed ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                <div className="w-28 text-sm font-medium text-slate-700">{dayLabel}</div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oh.isClosed}
                    onChange={(e) => updateOpeningHour(oh.dayOfWeek, 'isClosed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Closed</span>
                </label>

                {!oh.isClosed && (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="time"
                      value={oh.openTime}
                      onChange={(e) => updateOpeningHour(oh.dayOfWeek, 'openTime', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input
                      type="time"
                      value={oh.closeTime}
                      onChange={(e) => updateOpeningHour(oh.dayOfWeek, 'closeTime', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Services</h2>
            <p className="text-sm text-slate-500">Add the services your business offers</p>
          </div>
          <button
            onClick={addService}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium text-sm"
          >
            + Add Service
          </button>
        </div>
        
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
                placeholder="Service name"
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={service.duration}
                  onChange={(e) => updateService(index, 'duration', parseInt(e.target.value) || 30)}
                  placeholder="Duration"
                  min="1"
                  className="w-24 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
                />
                <span className="text-sm text-slate-500">min</span>
              </div>
              <button
                onClick={() => removeService(index)}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors font-medium text-sm"
                disabled={services.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Saving...
            </span>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </div>
  )
}
