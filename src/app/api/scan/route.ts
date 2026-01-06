import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tradingViewService } from '@/lib/tradingview'
import { emailService } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Check if request is from Vercel Cron
    const cronHeader = request.headers.get('x-vercel-cron')

    // If not from Vercel Cron, check for manual trigger with secret
    if (!cronHeader) {
      const { secret } = await request.json()
      if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const assets = await prisma.asset.findMany({
      where: { active: true },
    })

    let settings = await prisma.userSettings.findFirst()
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {},
      })
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastResetMonth = new Date(settings.lastMonthReset).getMonth()
    const lastResetYear = new Date(settings.lastYearReset).getFullYear()

    if (currentMonth !== lastResetMonth) {
      await prisma.userSettings.update({
        where: { id: settings.id },
        data: {
          currentMonthSpent: 0,
          lastMonthReset: now,
        },
      })
      settings.currentMonthSpent = 0
    }

    if (currentYear !== lastResetYear) {
      await prisma.userSettings.update({
        where: { id: settings.id },
        data: {
          currentYearSpent: 0,
          lastYearReset: now,
        },
      })
      settings.currentYearSpent = 0
    }

    const results = []

    for (const asset of assets) {
      try {
        const analysis = await tradingViewService.analyzeAsset(asset.symbol)

        if (!analysis) {
          console.log(`No analysis available for ${asset.symbol}`)
          continue
        }

        const meetsCombo20Threshold = analysis.combo20 >= settings.minCombo20
        const meetsCombo50Threshold = analysis.combo50 >= settings.minCombo50
        const meetsSignalStrength = analysis.signalStrength >= settings.minSignalStrength

        if (meetsCombo20Threshold && meetsCombo50Threshold && meetsSignalStrength) {
          const remainingMonthlyBudget = settings.monthlyMaxBudget - settings.currentMonthSpent
          const remainingYearlyBudget = settings.annualBudget - settings.currentYearSpent

          let suggestedAmount = Math.min(
            settings.maxPositionSize,
            remainingMonthlyBudget,
            remainingYearlyBudget
          )

          const signalBonus = (analysis.signalStrength - 70) / 30
          suggestedAmount = Math.min(
            suggestedAmount * (1 + signalBonus * 0.5),
            settings.maxPositionSize
          )

          if (suggestedAmount < 50) {
            console.log(`Insufficient budget for ${asset.symbol}`)
            continue
          }

          const notification = await prisma.notification.create({
            data: {
              assetId: asset.id,
              currentPrice: analysis.currentPrice,
              ma20: analysis.ma20,
              ma50: analysis.ma50,
              bollingerLower: analysis.bollingerLower,
              bollingerUpper: analysis.bollingerUpper,
              bollingerMiddle: analysis.bollingerMiddle,
              combo20: analysis.combo20,
              combo50: analysis.combo50,
              signalStrength: analysis.signalStrength,
              recommendation: analysis.recommendation,
              arguments: analysis.arguments,
              suggestedAmount,
              status: 'PENDING',
            },
          })

          if (settings.emailNotifications) {
            const emailSent = await emailService.sendEntrySignalNotification({
              assetSymbol: asset.symbol,
              assetName: asset.name,
              currentPrice: analysis.currentPrice,
              combo20: analysis.combo20,
              combo50: analysis.combo50,
              signalStrength: analysis.signalStrength,
              recommendation: analysis.recommendation,
              arguments: analysis.arguments,
              suggestedAmount,
              notificationId: notification.id,
            })

            await prisma.notification.update({
              where: { id: notification.id },
              data: { emailSent },
            })
          }

          results.push({
            asset: asset.symbol,
            notification: notification.id,
            signalStrength: analysis.signalStrength,
            combo20: analysis.combo20,
            combo50: analysis.combo50,
            suggestedAmount,
          })
        }
      } catch (error) {
        console.error(`Error analyzing ${asset.symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      scannedAssets: assets.length,
      notificationsCreated: results.length,
      results,
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Check if request is from Vercel Cron
  const cronHeader = request.headers.get('x-vercel-cron')

  if (!cronHeader) {
    return NextResponse.json({
      message: 'Use POST with { secret: "your-cron-secret" } to trigger a scan',
    })
  }

  // If from Vercel Cron, execute the scan logic
  try {
    const assets = await prisma.asset.findMany({
      where: { active: true },
    })

    let settings = await prisma.userSettings.findFirst()
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {},
      })
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastResetMonth = new Date(settings.lastMonthReset).getMonth()
    const lastResetYear = new Date(settings.lastYearReset).getFullYear()

    if (currentMonth !== lastResetMonth) {
      await prisma.userSettings.update({
        where: { id: settings.id },
        data: {
          currentMonthSpent: 0,
          lastMonthReset: now,
        },
      })
      settings.currentMonthSpent = 0
    }

    if (currentYear !== lastResetYear) {
      await prisma.userSettings.update({
        where: { id: settings.id },
        data: {
          currentYearSpent: 0,
          lastYearReset: now,
        },
      })
      settings.currentYearSpent = 0
    }

    const results = []

    for (const asset of assets) {
      try {
        const analysis = await tradingViewService.analyzeAsset(asset.symbol)

        if (!analysis) {
          console.log(`No analysis available for ${asset.symbol}`)
          continue
        }

        const meetsCombo20Threshold = analysis.combo20 >= settings.minCombo20
        const meetsCombo50Threshold = analysis.combo50 >= settings.minCombo50
        const meetsSignalStrength = analysis.signalStrength >= settings.minSignalStrength

        if (meetsCombo20Threshold && meetsCombo50Threshold && meetsSignalStrength) {
          const remainingMonthlyBudget = settings.monthlyMaxBudget - settings.currentMonthSpent
          const remainingYearlyBudget = settings.annualBudget - settings.currentYearSpent

          let suggestedAmount = Math.min(
            settings.maxPositionSize,
            remainingMonthlyBudget,
            remainingYearlyBudget
          )

          const signalBonus = (analysis.signalStrength - 70) / 30
          suggestedAmount = Math.min(
            suggestedAmount * (1 + signalBonus * 0.5),
            settings.maxPositionSize
          )

          if (suggestedAmount < 50) {
            console.log(`Insufficient budget for ${asset.symbol}`)
            continue
          }

          const notification = await prisma.notification.create({
            data: {
              assetId: asset.id,
              currentPrice: analysis.currentPrice,
              ma20: analysis.ma20,
              ma50: analysis.ma50,
              bollingerLower: analysis.bollingerLower,
              bollingerUpper: analysis.bollingerUpper,
              bollingerMiddle: analysis.bollingerMiddle,
              combo20: analysis.combo20,
              combo50: analysis.combo50,
              signalStrength: analysis.signalStrength,
              recommendation: analysis.recommendation,
              arguments: analysis.arguments,
              suggestedAmount,
              status: 'PENDING',
            },
          })

          if (settings.emailNotifications) {
            const emailSent = await emailService.sendEntrySignalNotification({
              assetSymbol: asset.symbol,
              assetName: asset.name,
              currentPrice: analysis.currentPrice,
              combo20: analysis.combo20,
              combo50: analysis.combo50,
              signalStrength: analysis.signalStrength,
              recommendation: analysis.recommendation,
              arguments: analysis.arguments,
              suggestedAmount,
              notificationId: notification.id,
            })

            await prisma.notification.update({
              where: { id: notification.id },
              data: { emailSent },
            })
          }

          results.push({
            asset: asset.symbol,
            notification: notification.id,
            signalStrength: analysis.signalStrength,
            combo20: analysis.combo20,
            combo50: analysis.combo50,
            suggestedAmount,
          })
        }
      } catch (error) {
        console.error(`Error analyzing ${asset.symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      scannedAssets: assets.length,
      notificationsCreated: results.length,
      results,
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
