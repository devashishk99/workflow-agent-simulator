import { prisma } from '@/lib/db'
import type { WorkflowContext, Channel } from './context'
import { WORKFLOW_TEMPLATE } from './template'
import * as steps from './steps'

export async function executeWorkflow(
  businessId: string,
  channel: Channel,
  rawMessage: string
): Promise<{ context: WorkflowContext; logEvents: Array<{ eventType: string; severity: string; message: string; metadata?: any }> }> {
  const context: WorkflowContext = {
    businessId,
    channel,
    rawMessage,
    validationErrors: [],
    actionsTaken: []
  }

  const logEvents: Array<{ eventType: string; severity: string; message: string; metadata?: any }> = []

  // Log message received
  logEvents.push({
    eventType: 'message_received',
    severity: 'info',
    message: `Message received via ${channel}`,
    metadata: { channel, messageLength: rawMessage.length }
  })

  try {
    // Get business data
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: true,
        openingHours: true
      }
    })

    if (!business) {
      throw new Error('Business not found')
    }

    // Execute workflow steps
    for (const stepName of WORKFLOW_TEMPLATE.steps) {
      try {
        switch (stepName) {
          case 'detect_intent':
            await steps.detectIntent(context)
            logEvents.push({
              eventType: 'intent_detected',
              severity: 'info',
              message: `Intent detected: ${context.intent}`,
              metadata: { intent: context.intent }
            })
            break

          case 'extract_name':
            await steps.extractName(context)
            if (context.customerName) {
              logEvents.push({
                eventType: 'name_extracted',
                severity: 'info',
                message: `Customer name extracted: ${context.customerName}`,
                metadata: { name: context.customerName }
              })
            }
            break

          case 'extract_datetime':
            await steps.extractDatetime(context)
            if (context.requestedDateTime) {
              logEvents.push({
                eventType: 'datetime_parsed',
                severity: 'info',
                message: `DateTime parsed: ${context.requestedDateTime.toISOString()}`,
                metadata: { datetime: context.requestedDateTime.toISOString() }
              })
            }
            break

          case 'extract_service':
            await steps.extractService(context, business.services)
            if (context.requestedService) {
              logEvents.push({
                eventType: 'service_matched',
                severity: 'info',
                message: `Service matched: ${context.requestedService}`,
                metadata: { service: context.requestedService }
              })
            }
            break

          case 'validate_required_fields':
            await steps.validateRequiredFields(context)
            if (context.validationErrors.length > 0) {
              logEvents.push({
                eventType: 'validation_failed_missing_fields',
                severity: 'warning',
                message: 'Required fields validation failed',
                metadata: { errors: context.validationErrors }
              })
            }
            break

          case 'validate_opening_hours':
            await steps.validateOpeningHours(context, business.openingHours)
            if (context.validationErrors.some(e => e.includes('closed') || e.includes('open'))) {
              logEvents.push({
                eventType: 'validation_failed_outside_hours',
                severity: 'warning',
                message: 'Opening hours validation failed',
                metadata: { errors: context.validationErrors }
              })
            }
            break

          case 'create_airtable_lead':
            try {
              const leadResult = await steps.createAirtableLead(context)
              if (leadResult.success) {
                logEvents.push({
                  eventType: 'airtable_lead_created',
                  severity: 'info',
                  message: `Lead created in Airtable: ${leadResult.recordId}`,
                  metadata: { recordId: leadResult.recordId }
                })
              } else {
                logEvents.push({
                  eventType: 'airtable_lead_failed',
                  severity: 'warning',
                  message: `Failed to create lead in Airtable: ${leadResult.error}`,
                  metadata: { error: leadResult.error }
                })
              }
            } catch (error: any) {
              logEvents.push({
                eventType: 'airtable_lead_error',
                severity: 'error',
                message: `Error creating Airtable lead: ${error.message}`,
                metadata: { error: error.message }
              })
            }
            break

          case 'create_airtable_booking':
            if (context.intent === 'booking' && !context.validationErrors.length) {
              try {
                const bookingResult = await steps.createAirtableBooking(context)
                if (bookingResult.success) {
                  logEvents.push({
                    eventType: 'airtable_booking_created',
                    severity: 'info',
                    message: `Booking created in Airtable: ${bookingResult.recordId}`,
                    metadata: { recordId: bookingResult.recordId }
                  })
                } else {
                  logEvents.push({
                    eventType: 'airtable_booking_failed',
                    severity: 'warning',
                    message: `Failed to create booking in Airtable: ${bookingResult.error}`,
                    metadata: { error: bookingResult.error }
                  })
                }
              } catch (error: any) {
                logEvents.push({
                  eventType: 'airtable_booking_error',
                  severity: 'error',
                  message: `Error creating Airtable booking: ${error.message}`,
                  metadata: { error: error.message }
                })
              }
            }
            break

          case 'build_response':
            await steps.buildResponse(context, business.openingHours)
            logEvents.push({
              eventType: 'response_generated',
              severity: 'info',
              message: 'Response message generated',
              metadata: { response: context.responseMessage }
            })
            break
        }

        // Stop execution if validation errors exist and we've built response
        if (context.validationErrors.length > 0 && stepName === 'build_response') {
          break
        }
      } catch (stepError: any) {
        logEvents.push({
          eventType: `step_error_${stepName}`,
          severity: 'error',
          message: `Error in step ${stepName}: ${stepError.message}`,
          metadata: { error: stepError.message }
        })
      }
    }
  } catch (error: any) {
    logEvents.push({
      eventType: 'workflow_error',
      severity: 'error',
      message: `Workflow execution error: ${error.message}`,
      metadata: { error: error.message }
    })
  }

  return { context, logEvents }
}
