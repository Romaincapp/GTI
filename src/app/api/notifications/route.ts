import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = status ? { status } : {}

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        asset: true,
        position: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, status, viewed } = await request.json()

    const data: any = {}
    if (status !== undefined) data.status = status
    if (viewed !== undefined) data.viewed = viewed

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data,
      include: {
        asset: true,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
