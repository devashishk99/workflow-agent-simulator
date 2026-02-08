import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Fetch workflow runs with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get workflow runs with related data
    const runs = await prisma.workflowRun.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        message: {
          select: {
            channel: true,
            rawMessage: true,
            createdAt: true
          }
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.workflowRun.count()

    // Get metrics
    const successCount = await prisma.workflowRun.count({
      where: { status: 'success' }
    })
    const failedCount = await prisma.workflowRun.count({
      where: { status: 'failed' }
    })
    const partialCount = await prisma.workflowRun.count({
      where: { status: 'partial' }
    })

    // Count booking successes (runs with booking intent and success status)
    const bookingRuns = await prisma.workflowRun.findMany({
      where: {
        status: 'success'
      },
      select: {
        context: true
      }
    })

    const bookingSuccessCount = bookingRuns.filter(run => {
      try {
        const context = JSON.parse(run.context as string)
        return context.intent === 'booking' && context.actionsTaken?.some((action: string) => 
          action.includes('airtable_booking_created') || action.includes('booking_confirmed')
        )
      } catch {
        return false
      }
    }).length

    return NextResponse.json({
      runs: runs.map(run => {
        let context: any = {}
        try {
          context = JSON.parse(run.context as string)
        } catch {
          // If parsing fails, use empty object
        }

        return {
          id: run.id,
          status: run.status,
          createdAt: run.createdAt.toISOString(),
          message: {
            channel: run.message.channel,
            rawMessage: run.message.rawMessage.substring(0, 100) + (run.message.rawMessage.length > 100 ? '...' : ''),
            createdAt: run.message.createdAt.toISOString()
          },
          context: {
            intent: context.intent,
            customerName: context.customerName,
            requestedService: context.requestedService,
            responseMessage: context.responseMessage
          }
        }
      }),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      metrics: {
        total,
        success: successCount,
        failed: failedCount,
        partial: partialCount,
        bookingSuccess: bookingSuccessCount
      }
    })
  } catch (error: any) {
    console.error('Error fetching workflow runs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow runs', details: error.message },
      { status: 500 }
    )
  }
}
