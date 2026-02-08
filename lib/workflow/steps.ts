import * as chrono from 'chrono-node'
import type { WorkflowContext } from './context'
import { createLead, createBooking } from '@/lib/airtable/client'

export async function detectIntent(context: WorkflowContext): Promise<void> {
  const message = context.rawMessage.toLowerCase()
  
  // Check cancel FIRST (before booking, since "cancel appointment" contains "appointment")
  if (message.match(/\b(cancel|cancelled|canceling|cancellation|can't make it|won't be able|need to cancel)\b/)) {
    context.intent = 'cancel'
    return
  }
  
  // Check reschedule SECOND (before booking)
  if (message.match(/\b(reschedule|change|move|different time|another time)\b/)) {
    context.intent = 'reschedule'
    return
  }
  
  // Check info keywords (including hours questions)
  if (message.match(/\b(open|hours|opening|when are you|what time|where|price|cost|info|information|what are your)\b/)) {
    context.intent = 'info'
    return
  }
  
  // Escalation keywords (angry customer) - check before booking
  if (message.match(/\b(angry|ridiculous|complaint|terrible|never answer|frustrated|upset)\b/)) {
    context.intent = 'info' // Set to info for escalation handling
    return
  }
  
  // Booking keywords - check after cancel/reschedule to avoid false positives
  // Also detect "need [service]" or "want [service]" or "I'd like" patterns
  // Check for explicit booking words first
  if (message.match(/\b(book|appointment|reserve|schedule|make an appointment)\b/)) {
    context.intent = 'booking'
    return
  }
  
  // Then check for "need/want/I'd like" + service keywords
  if (message.match(/\b(need|want|i'?d like)\b.*\b(haircut|service|appointment|trim|shave)\b/i)) {
    context.intent = 'booking'
    return
  }
  
  context.intent = 'unknown'
}

export async function extractName(context: WorkflowContext): Promise<void> {
  const message = context.rawMessage
  
  // Pattern: "I'm [Name]"
  const imPattern = /i'?m\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  const imMatch = message.match(imPattern)
  if (imMatch) {
    context.customerName = imMatch[1]
    return
  }
  
  // Pattern: "My name is [Name]"
  const namePattern = /my name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  const nameMatch = message.match(namePattern)
  if (nameMatch) {
    context.customerName = nameMatch[1]
    return
  }
  
  // Pattern: "This is [Name]"
  const thisPattern = /this is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  const thisMatch = message.match(thisPattern)
  if (thisMatch) {
    context.customerName = thisMatch[1]
    return
  }
}

export async function extractDatetime(context: WorkflowContext): Promise<void> {
  try {
    const parsed = chrono.parseDate(context.rawMessage)
    if (parsed && parsed instanceof Date) {
      context.requestedDateTime = parsed
    }
  } catch (error) {
    // If parsing fails, datetime remains undefined
  }
}

export async function extractService(
  context: WorkflowContext,
  availableServices: { name: string }[]
): Promise<void> {
  const message = context.rawMessage.toLowerCase()
  
  for (const service of availableServices) {
    const serviceName = service.name.toLowerCase()
    if (message.includes(serviceName)) {
      context.requestedService = service.name
      return
    }
  }
}

export async function validateRequiredFields(context: WorkflowContext): Promise<void> {
  if (context.intent === 'booking') {
    if (!context.requestedService) {
      context.validationErrors.push('Service is required for booking')
    }
    if (!context.requestedDateTime) {
      context.validationErrors.push('Date and time are required for booking')
    }
  }
}

export async function validateOpeningHours(
  context: WorkflowContext,
  openingHours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>
): Promise<void> {
  if (!context.requestedDateTime || context.intent !== 'booking') {
    return
  }
  
  const requestedDate = new Date(context.requestedDateTime)
  const dayOfWeek = requestedDate.getDay() === 0 ? 6 : requestedDate.getDay() - 1 // Convert to 0-6 (Mon-Sun)
  
  const hours = openingHours.find(oh => oh.dayOfWeek === dayOfWeek)
  
  if (!hours || hours.isClosed) {
    context.validationErrors.push(`We're closed on ${getDayName(dayOfWeek)}`)
    return
  }
  
  // Extract time from requested datetime
  const requestedTime = `${String(requestedDate.getHours()).padStart(2, '0')}:${String(requestedDate.getMinutes()).padStart(2, '0')}`
  
  if (requestedTime < hours.openTime || requestedTime > hours.closeTime) {
    context.validationErrors.push(`We're open ${hours.openTime} to ${hours.closeTime} on ${getDayName(dayOfWeek)}`)
  }
}

function getDayName(dayOfWeek: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayOfWeek]
}

export async function buildResponse(
  context: WorkflowContext,
  openingHours?: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>
): Promise<void> {
  // Handle escalation (angry customer)
  const isEscalation = context.rawMessage.toLowerCase().match(/\b(angry|ridiculous|complaint|terrible|never answer|frustrated|upset)\b/)
  
  if (isEscalation) {
    context.responseMessage = "I understand your frustration. Let me connect you with our team right away. Someone will reach out to you shortly."
    context.actionsTaken.push('escalation_triggered')
    return
  }
  
  // Handle validation errors
  if (context.validationErrors.length > 0) {
    if (context.intent === 'booking') {
      if (!context.requestedService && !context.requestedDateTime) {
        context.responseMessage = "I'd be happy to help you book an appointment! Could you please let me know what service you'd like and when you'd prefer to come in?"
      } else if (!context.requestedService) {
        context.responseMessage = "Great! What service would you like to book?"
      } else if (!context.requestedDateTime) {
        context.responseMessage = `Perfect! When would you like to schedule your ${context.requestedService}?`
      } else {
        context.responseMessage = context.validationErrors.join('. ') + " Would you like to choose a different time?"
      }
    } else {
      context.responseMessage = context.validationErrors.join('. ')
    }
    return
  }
  
  // Handle successful booking
  if (context.intent === 'booking' && context.requestedService && context.requestedDateTime) {
    const dateStr = new Date(context.requestedDateTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    context.responseMessage = `Perfect! You're booked for a ${context.requestedService} on ${dateStr}. We'll see you then!`
    context.actionsTaken.push('booking_confirmed')
    return
  }
  
  // Handle cancel
  if (context.intent === 'cancel') {
    context.responseMessage = "I can help you cancel your appointment. Could you tell me what time it was scheduled for?"
    return
  }
  
  // Handle reschedule
  if (context.intent === 'reschedule') {
    context.responseMessage = "I'd be happy to help you reschedule. What time would work better for you?"
    return
  }
  
  // Handle info
  if (context.intent === 'info') {
    const message = context.rawMessage.toLowerCase()
    
    // Check if asking about hours
    if (message.match(/\b(hours|opening|when are you|what time|open|closed)\b/)) {
      if (openingHours && openingHours.length > 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const hoursList = openingHours
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map(oh => {
            const dayName = days[oh.dayOfWeek]
            if (oh.isClosed) {
              return `${dayName}: Closed`
            }
            return `${dayName}: ${oh.openTime} - ${oh.closeTime}`
          })
          .join('\n')
        
        context.responseMessage = `Here are our opening hours:\n\n${hoursList}\n\nHow can I help you today?`
      } else {
        context.responseMessage = "I'd be happy to share our hours! However, our hours haven't been configured yet. Please contact us directly for our current hours."
      }
      return
    }
    
    context.responseMessage = "I'd be happy to help! What information are you looking for?"
    return
  }
  
  // Default response
  context.responseMessage = "I'm here to help! How can I assist you today?"
}

export async function createAirtableLead(context: WorkflowContext): Promise<{ success: boolean; recordId?: string; error?: string }> {
  try {
    const result = await createLead({
      Name: context.customerName,
      Channel: context.channel,
      Intent: context.intent || 'unknown',
      LastMessage: context.rawMessage,
      CreatedAt: new Date().toISOString().split('T')[0],
      UpdatedAt: new Date().toISOString().split('T')[0]
    })

    if (result.success) {
      context.actionsTaken.push(`airtable_lead_created:${result.recordId}`)
    } else {
      context.actionsTaken.push(`airtable_lead_failed:${result.error}`)
    }

    return result
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to create Airtable lead'
    context.actionsTaken.push(`airtable_lead_failed:${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

export async function createAirtableBooking(context: WorkflowContext): Promise<{ success: boolean; recordId?: string; error?: string }> {
  // Only create booking if intent is booking and we have required data
  if (context.intent !== 'booking' || !context.requestedService || !context.requestedDateTime) {
    return { success: false, error: 'Booking data incomplete' }
  }

  // Don't create booking if there are validation errors
  if (context.validationErrors.length > 0) {
    return { success: false, error: 'Validation errors prevent booking creation' }
  }

  try {
    const result = await createBooking({
      Name: context.customerName,
      Service: context.requestedService,
      DateTime: context.requestedDateTime.toISOString(),
      Status: 'confirmed',
      SourceMessage: context.rawMessage,
      Channel: context.channel
    })

    if (result.success) {
      context.actionsTaken.push(`airtable_booking_created:${result.recordId}`)
    } else {
      context.actionsTaken.push(`airtable_booking_failed:${result.error}`)
    }

    return result
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to create Airtable booking'
    context.actionsTaken.push(`airtable_booking_failed:${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}
