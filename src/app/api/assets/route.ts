import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { symbol: 'asc' },
    })

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { symbol, name, assetType } = await request.json()

    const asset = await prisma.asset.create({
      data: {
        symbol,
        name,
        assetType,
        active: true,
      },
    })

    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { assetId, active } = await request.json()

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: { active },
    })

    return NextResponse.json({ asset })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}
