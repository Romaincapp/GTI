import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const sp500 = await prisma.asset.upsert({
    where: { symbol: 'SPX500' },
    update: {},
    create: {
      symbol: 'SPX500',
      name: 'S&P 500',
      assetType: 'INDEX',
      active: true,
    },
  })

  const gold = await prisma.asset.upsert({
    where: { symbol: 'XAUUSD' },
    update: {},
    create: {
      symbol: 'XAUUSD',
      name: 'Gold',
      assetType: 'COMMODITY',
      active: true,
    },
  })

  const settings = await prisma.userSettings.findFirst()
  if (!settings) {
    await prisma.userSettings.create({
      data: {
        annualBudget: 1000,
        monthlyMaxBudget: 100,
        maxPositionSize: 200,
        minCombo20: 0.95,
        minCombo50: 0.92,
        minSignalStrength: 70,
        emailNotifications: true,
      },
    })
    console.log('✅ User settings created')
  }

  console.log('✅ Assets created:', { sp500: sp500.symbol, gold: gold.symbol })
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
