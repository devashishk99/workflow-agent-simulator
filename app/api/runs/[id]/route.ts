import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Fetch single workflow run with all log events
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const runId = params.id

    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        message: {
          select: {
            channel: true,
            rawMessage: true,
            createdAt: true
          }
        },
        logEvents: {
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    if (!run) {
      return NextResponse.json(
        { error: 'Workflow run not found' },
        { status: 404 }
      )
    }

    let context: any = {}
    try {
      context = JSON.parse(run.context as string)
    } catch {
      // If parsing fails, use empty object
    }

    return NextResponse.json({
      run: {
        id: run.id,
        status: run.status,
        createdAt: run.createdAt.toISOString(),
        message: {
          channel: run.message.channel,
          rawMessage: run.message.rawMessage,
          createdAt: run.message.createdAt.toISOString()
        },
        context: {
          intent: context.intent,
          customerName: context.customerName,
          requestedDateTime: context.requestedDateTime,
          requestedService: context.requestedService,
          validationErrors: context.validationErrors || [],
          responseMessage: context.responseMessage,
          actionsTaken: context.actionsTaken || []
        },
        logEvents: run.logEvents.map(event => ({
          id: event.id,
          timestamp: event.timestamp.toISOString(),
          eventType: event.eventType,
          severity: event.severity,
          message: event.message,
          metadata: event.metadata ? JSON.parse(event.metadata) : null
        }))
      }
    })
  } catch (error: any) {
    console.error('Error fetching workflow run:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow run', details: error.message },
      { status: 500 }
    )
  }
}

