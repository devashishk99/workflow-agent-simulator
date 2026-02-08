import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Fetch current business configuration
export async function GET() {
  try {
    // Get the first business (for now, we'll support single business)
    // In a multi-tenant app, you'd get businessId from auth/session
    const business = await prisma.business.findFirst({
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        services: {
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ 
        business: null,
        openingHours: [],
        services: []
      })
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        timezone: business.timezone
      },
      openingHours: business.openingHours.map((oh: typeof business.openingHours[0]) => ({
        id: oh.id,
        dayOfWeek: oh.dayOfWeek,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isClosed: oh.isClosed
      })),
      services: business.services.map((s: typeof business.services[0]) => ({
        id: s.id,
        name: s.name,
        duration: s.duration
      }))
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business configuration' },
      { status: 500 }
    )
  }
}

// POST: Create or update business configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business, openingHours, services } = body

    // Validate required fields
    if (!business || !business.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    // Get or create business
    let businessRecord = await prisma.business.findFirst()
    
    if (businessRecord) {
      // Update existing business
      businessRecord = await prisma.business.update({
        where: { id: businessRecord.id },
        data: {
          name: business.name,
          timezone: business.timezone || null
        }
      })
    } else {
      // Create new business
      businessRecord = await prisma.business.create({
        data: {
          name: business.name,
          timezone: business.timezone || null
        }
      })
    }

    const businessId = businessRecord.id

    // Update opening hours
    if (openingHours && Array.isArray(openingHours)) {
      // Delete existing opening hours
      await prisma.openingHours.deleteMany({
        where: { businessId }
      })

      // Create new opening hours
      await prisma.openingHours.createMany({
        data: openingHours.map((oh: any) => ({
          businessId,
          dayOfWeek: oh.dayOfWeek,
          openTime: oh.openTime,
          closeTime: oh.closeTime,
          isClosed: oh.isClosed || false
        }))
      })
    }

    // Update services
    if (services && Array.isArray(services)) {
      // Delete existing services
      await prisma.service.deleteMany({
        where: { businessId }
      })

      // Create new services
      if (services.length > 0) {
        await prisma.service.createMany({
          data: services.map((s: any) => ({
            businessId,
            name: s.name,
            duration: parseInt(s.duration) || 30
          }))
        })
      }
    }

    // Fetch updated business with relations
    const updated = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' }
        },
        services: {
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Business not found after update' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      business: {
        id: updated.id,
        name: updated.name,
        timezone: updated.timezone
      },
      openingHours: updated.openingHours.map((oh: (typeof updated.openingHours)[number]) => ({
        id: oh.id,
        dayOfWeek: oh.dayOfWeek,
        openTime: oh.openTime,
        closeTime: oh.closeTime,
        isClosed: oh.isClosed
      })),
      services: updated.services.map((s: (typeof updated.services)[number]) => ({
        id: s.id,
        name: s.name,
        duration: s.duration
      }))
    })
  } catch (error) {
    console.error('Error saving business:', error)
    return NextResponse.json(
      { error: 'Failed to save business configuration' },
      { status: 500 }
    )
  }
}
