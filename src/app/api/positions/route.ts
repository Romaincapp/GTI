import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const {
      notificationId,
      entryPrice,
      quantity,
      investedAmount,
      entryDate,
      notes,
    } = await request.json()

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { asset: true },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const position = await prisma.position.create({
      data: {
        notificationId,
        assetId: notification.assetId,
        entryPrice,
        quantity,
        investedAmount,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        notes,
        status: 'OPEN',
      },
      include: {
        asset: true,
        notification: true,
      },
    })

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'EXECUTED' },
    })

    const settings = await prisma.userSettings.findFirst()
    if (settings) {
      await prisma.userSettings.update({
        where: { id: settings.id },
        data: {
          currentMonthSpent: settings.currentMonthSpent + investedAmount,
          currentYearSpent: settings.currentYearSpent + investedAmount,
        },
      })
    }

    return NextResponse.json({ position })
  } catch (error) {
    console.error('Error creating position:', error)
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const positions = await prisma.position.findMany({
      where,
      include: {
        asset: true,
        notification: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    })

    return NextResponse.json({ positions })
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const {
      positionId,
      exitPrice,
      exitDate,
      notes,
    } = await request.json()

    const position = await prisma.position.findUnique({
      where: { id: positionId },
    })

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    const data: any = {}

    if (exitPrice !== undefined && exitDate !== undefined) {
      const realizedPnL = (exitPrice - position.entryPrice) * position.quantity
      const realizedPnLPct = ((exitPrice - position.entryPrice) / position.entryPrice) * 100

      data.exitPrice = exitPrice
      data.exitDate = new Date(exitDate)
      data.realizedPnL = realizedPnL
      data.realizedPnLPct = realizedPnLPct
      data.status = 'CLOSED'
    }

    if (notes !== undefined) {
      data.notes = notes
    }

    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data,
      include: {
        asset: true,
        notification: true,
      },
    })

    return NextResponse.json({ position: updatedPosition })
  } catch (error) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    )
  }
}
