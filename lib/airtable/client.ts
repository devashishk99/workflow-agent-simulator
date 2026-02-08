// Airtable API client

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
  console.warn('Airtable credentials not configured. Airtable integration will be disabled.')
}

export interface AirtableLead {
  Name?: string
  Channel: 'web' | 'email' | 'sms'
  Intent: 'booking' | 'cancel' | 'reschedule' | 'info' | 'unknown'
  LastMessage: string
  CreatedAt?: string
  UpdatedAt?: string
}

export interface AirtableBooking {
  Name?: string
  Service: string
  DateTime: string
  Status: 'pending' | 'confirmed' | 'cancelled'
  SourceMessage: string
  Channel: 'web' | 'email' | 'sms'
}

export async function createLead(lead: AirtableLead): Promise<{ success: boolean; recordId?: string; error?: string }> {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return { success: false, error: 'Airtable credentials not configured' }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Name: lead.Name || 'Anonymous',
          Channel: lead.Channel,
          Intent: lead.Intent,
          LastMessage: lead.LastMessage,
          CreatedAt: lead.CreatedAt || new Date().toISOString().split('T')[0],
          UpdatedAt: lead.UpdatedAt || new Date().toISOString().split('T')[0]
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Airtable API error: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, recordId: data.id }
  } catch (error: any) {
    console.error('Error creating Airtable lead:', error)
    return { success: false, error: error.message || 'Failed to create lead in Airtable' }
  }
}

export async function createBooking(booking: AirtableBooking): Promise<{ success: boolean; recordId?: string; error?: string }> {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return { success: false, error: 'Airtable credentials not configured' }
  }

  try {
    // Format datetime for Airtable (YYYY-MM-DDTHH:mm:ss)
    const dateTimeStr = new Date(booking.DateTime).toISOString().split('.')[0]

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Name: booking.Name || 'Anonymous',
          Service: booking.Service,
          DateTime: dateTimeStr,
          Status: booking.Status,
          SourceMessage: booking.SourceMessage,
          Channel: booking.Channel
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Airtable API error: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, recordId: data.id }
  } catch (error: any) {
    console.error('Error creating Airtable booking:', error)
    return { success: false, error: error.message || 'Failed to create booking in Airtable' }
  }
}
