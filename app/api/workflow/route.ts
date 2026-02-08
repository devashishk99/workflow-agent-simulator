import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { executeWorkflow } from '@/lib/workflow/engine'
import type { Channel } from '@/lib/workflow/context'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, message } = body

    // Validate input
    if (!channel || !['web', 'email', 'sms'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be web, email, or sms' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get business (for now, get first business)
    const business = await prisma.business.findFirst()
    if (!business) {
      return NextResponse.json(
        { error: 'No business configured. Please set up your business in Admin first.' },
        { status: 400 }
      )
    }

    // Create message record
    const messageRecord = await prisma.message.create({
      data: {
        businessId: business.id,
        channel: channel as Channel,
        rawMessage: message.trim()
      }
    })

    // Execute workflow
    const { context, logEvents } = await executeWorkflow(
      business.id,
      channel as Channel,
      message.trim()
    )

    // Determine workflow status
    let status = 'success'
    if (context.validationErrors.length > 0) {
      status = 'partial'
    }
    if (logEvents.some(e => e.severity === 'error')) {
      status = 'failed'
    }

    // Create workflow run
    const workflowRun = await prisma.workflowRun.create({
      data: {
        messageId: messageRecord.id,
        businessId: business.id,
        status,
        context: JSON.stringify(context)
      }
    })

    // Create log events
    await prisma.logEvent.createMany({
      data: logEvents.map(event => ({
        workflowRunId: workflowRun.id,
        timestamp: new Date(),
        eventType: event.eventType,
        severity: event.severity,
        message: event.message,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null
      }))
    })

    // Return response
    return NextResponse.json({
      success: true,
      workflowRunId: workflowRun.id,
      result: {
        intent: context.intent,
        customerName: context.customerName,
        requestedDateTime: context.requestedDateTime?.toISOString(),
        requestedService: context.requestedService,
        validationErrors: context.validationErrors,
        responseMessage: context.responseMessage,
        actionsTaken: context.actionsTaken
      },
      logEvents: logEvents.map(e => ({
        eventType: e.eventType,
        severity: e.severity,
        message: e.message,
        timestamp: new Date().toISOString()
      }))
    })
  } catch (error: any) {
    console.error('Error processing workflow:', error)
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    )
  }
}
