import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.userSettings.findFirst()

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {},
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json()

    let settings = await prisma.userSettings.findFirst()

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: updates,
      })
    } else {
      settings = await prisma.userSettings.update({
        where: { id: settings.id },
        data: updates,
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
