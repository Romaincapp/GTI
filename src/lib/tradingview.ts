import axios from 'axios'

export interface MarketData {
  symbol: string
  timestamp: number
  close: number
  high: number
  low: number
  open: number
  volume: number
}

export interface TechnicalIndicators {
  ma20: number
  ma50: number
  bollingerUpper: number
  bollingerMiddle: number
  bollingerLower: number
  currentPrice: number
}

export interface ComboIndicators extends TechnicalIndicators {
  combo20: number
  combo50: number
  signalStrength: number
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'WAIT'
  arguments: string
}

// Symbol mapping for different APIs
const SYMBOL_MAPPINGS: Record<string, { yahoo: string; alpha: string; twelve: string }> = {
  'SPX500': { yahoo: '^GSPC', alpha: 'SPX', twelve: 'SPX' },
  'SPX': { yahoo: '^GSPC', alpha: 'SPX', twelve: 'SPX' },
  'XAUUSD': { yahoo: 'GC=F', alpha: 'XAUUSD', twelve: 'XAUUSD' },
  'GOLD': { yahoo: 'GC=F', alpha: 'XAUUSD', twelve: 'XAUUSD' },
}

class MarketDataService {
  private alphaVantageKey: string
  private twelveDataKey: string

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || ''
    this.twelveDataKey = process.env.TWELVE_DATA_API_KEY || ''
  }

  // Yahoo Finance - Source principale (gratuit, illimité)
  private async fetchYahooFinance(symbol: string, limit: number = 50): Promise<MarketData[] | null> {
    try {
      console.log(`📊 Trying Yahoo Finance for ${symbol}...`)

      const mapping = SYMBOL_MAPPINGS[symbol]
      const yahooSymbol = mapping ? mapping.yahoo : symbol

      const endDate = Math.floor(Date.now() / 1000)
      const startDate = endDate - (limit + 10) * 24 * 60 * 60

      // Use direct Yahoo Finance v8 API (works better with Next.js)
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startDate}&period2=${endDate}&interval=1d`

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10000,
      })

      const chart = response.data?.chart?.result?.[0]
      if (!chart || !chart.timestamp) {
        console.warn(`⚠️ Yahoo Finance: No data for ${yahooSymbol}`)
        return null
      }

      const timestamps = chart.timestamp
      const quotes = chart.indicators?.quote?.[0]

      if (!quotes) {
        console.warn(`⚠️ Yahoo Finance: No quote data for ${yahooSymbol}`)
        return null
      }

      const marketData: MarketData[] = timestamps
        .map((timestamp: number, index: number) => ({
          symbol,
          timestamp: timestamp * 1000,
          close: quotes.close[index],
          high: quotes.high[index],
          low: quotes.low[index],
          open: quotes.open[index],
          volume: quotes.volume[index] || 0,
        }))
        .filter((d: MarketData) => d.close !== null)
        .slice(-limit)

      console.log(`✅ Yahoo Finance: Got ${marketData.length} data points for ${symbol}`)
      return marketData
    } catch (error) {
      console.error(`❌ Yahoo Finance error for ${symbol}:`, error)
      return null
    }
  }

  // Alpha Vantage - Fallback 1 (25 req/jour gratuit)
  private async fetchAlphaVantage(symbol: string, limit: number = 50): Promise<MarketData[] | null> {
    if (!this.alphaVantageKey) {
      console.log('⚠️ Alpha Vantage API key not configured')
      return null
    }

    try {
      console.log(`📊 Trying Alpha Vantage for ${symbol}...`)

      const mapping = SYMBOL_MAPPINGS[symbol]
      const alphaSymbol = mapping ? mapping.alpha : symbol

      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: alphaSymbol,
          apikey: this.alphaVantageKey,
          outputsize: 'compact',
        },
        timeout: 10000,
      })

      const timeSeries = response.data['Time Series (Daily)']
      if (!timeSeries) {
        console.warn(`⚠️ Alpha Vantage: No data for ${alphaSymbol}`)
        return null
      }

      const marketData: MarketData[] = Object.entries(timeSeries)
        .slice(0, limit)
        .map(([date, data]: [string, any]) => ({
          symbol,
          timestamp: new Date(date).getTime(),
          close: parseFloat(data['4. close']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          open: parseFloat(data['1. open']),
          volume: parseFloat(data['5. volume']),
        }))
        .reverse()

      console.log(`✅ Alpha Vantage: Got ${marketData.length} data points for ${symbol}`)
      return marketData
    } catch (error) {
      console.error(`❌ Alpha Vantage error for ${symbol}:`, error)
      return null
    }
  }

  // Twelve Data - Fallback 2 (800 req/jour gratuit)
  private async fetchTwelveData(symbol: string, limit: number = 50): Promise<MarketData[] | null> {
    if (!this.twelveDataKey) {
      console.log('⚠️ Twelve Data API key not configured')
      return null
    }

    try {
      console.log(`📊 Trying Twelve Data for ${symbol}...`)

      const mapping = SYMBOL_MAPPINGS[symbol]
      const twelveSymbol = mapping ? mapping.twelve : symbol

      const response = await axios.get('https://api.twelvedata.com/time_series', {
        params: {
          symbol: twelveSymbol,
          interval: '1day',
          outputsize: limit,
          apikey: this.twelveDataKey,
        },
        timeout: 10000,
      })

      const values = response.data.values
      if (!values || values.length === 0) {
        console.warn(`⚠️ Twelve Data: No data for ${twelveSymbol}`)
        return null
      }

      const marketData: MarketData[] = values
        .map((data: any) => ({
          symbol,
          timestamp: new Date(data.datetime).getTime(),
          close: parseFloat(data.close),
          high: parseFloat(data.high),
          low: parseFloat(data.low),
          open: parseFloat(data.open),
          volume: parseFloat(data.volume),
        }))
        .reverse()

      console.log(`✅ Twelve Data: Got ${marketData.length} data points for ${symbol}`)
      return marketData
    } catch (error) {
      console.error(`❌ Twelve Data error for ${symbol}:`, error)
      return null
    }
  }

  // Fallback: Mock data
  private getMockData(symbol: string, limit: number = 50): MarketData[] {
    console.log(`⚠️ Using MOCK data for ${symbol}`)

    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const basePrice = symbol.includes('SPX') || symbol.includes('SP500') ? 4500 : 2000

    return Array.from({ length: limit }, (_, i) => {
      const trend = -0.5 + (i * 0.02)
      const volatility = Math.sin(i / 5) * 30
      const price = basePrice + trend * 50 + volatility

      return {
        symbol,
        timestamp: now - (limit - i) * dayMs,
        close: price,
        high: price * 1.01,
        low: price * 0.99,
        open: price * 0.995,
        volume: 1000000 + Math.random() * 500000,
      }
    })
  }

  // Main method with cascade fallback
  async getMarketData(symbol: string, interval: string = '1D', limit: number = 50): Promise<MarketData[]> {
    // Try Yahoo Finance first (free, unlimited)
    let data = await this.fetchYahooFinance(symbol, limit)
    if (data && data.length >= 20) return data

    // Fallback to Alpha Vantage
    data = await this.fetchAlphaVantage(symbol, limit)
    if (data && data.length >= 20) return data

    // Fallback to Twelve Data
    data = await this.fetchTwelveData(symbol, limit)
    if (data && data.length >= 20) return data

    // Last resort: Mock data
    console.warn(`⚠️ All APIs failed for ${symbol}, using mock data`)
    return this.getMockData(symbol, limit)
  }
}

class TradingViewService {
  private marketDataService: MarketDataService

  constructor() {
    this.marketDataService = new MarketDataService()
  }

  async getMarketData(symbol: string, interval: string = '1D', limit: number = 50): Promise<MarketData[]> {
    return this.marketDataService.getMarketData(symbol, interval, limit)
  }

  calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0
    const slice = data.slice(-period)
    const sum = slice.reduce((acc, val) => acc + val, 0)
    return sum / period
  }

  calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): {
    upper: number
    middle: number
    lower: number
  } {
    if (data.length < period) {
      return { upper: 0, middle: 0, lower: 0 }
    }

    const slice = data.slice(-period)
    const sma = this.calculateSMA(slice, period)

    const squaredDiffs = slice.map(val => Math.pow(val - sma, 2))
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period
    const standardDeviation = Math.sqrt(variance)

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    try {
      const marketData = await this.getMarketData(symbol, '1D', 50)

      if (!marketData || marketData.length === 0) {
        return null
      }

      const closePrices = marketData.map(d => d.close)
      const currentPrice = closePrices[closePrices.length - 1]

      const ma20 = this.calculateSMA(closePrices, 20)
      const ma50 = this.calculateSMA(closePrices, 50)
      const bollinger = this.calculateBollingerBands(closePrices, 20, 2)

      return {
        currentPrice,
        ma20,
        ma50,
        bollingerUpper: bollinger.upper,
        bollingerMiddle: bollinger.middle,
        bollingerLower: bollinger.lower,
      }
    } catch (error) {
      console.error(`Error calculating technical indicators for ${symbol}:`, error)
      return null
    }
  }

  calculateComboIndicators(indicators: TechnicalIndicators): ComboIndicators {
    const { currentPrice, ma20, ma50, bollingerLower, bollingerUpper, bollingerMiddle } = indicators

    const combo20 = bollingerLower > 0 ? ma20 / bollingerLower : 0
    const combo50 = bollingerLower > 0 ? ma50 / bollingerLower : 0

    const priceVsBollingerLower = bollingerLower > 0 ? currentPrice / bollingerLower : 1
    const distanceFromMA20 = ma20 > 0 ? Math.abs(currentPrice - ma20) / ma20 : 1
    const distanceFromMA50 = ma50 > 0 ? Math.abs(currentPrice - ma50) / ma50 : 1

    let signalStrength = 0
    let recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'WAIT' = 'WAIT'
    const arguments_array: string[] = []

    if (combo20 >= 0.98) {
      signalStrength += 40
      arguments_array.push(`🎯 COMBO20 = ${combo20.toFixed(4)} (≈1.00) - Signal très fort: MA20 et Bollinger basse quasi-alignées`)
    } else if (combo20 >= 0.95) {
      signalStrength += 30
      arguments_array.push(`✅ COMBO20 = ${combo20.toFixed(4)} - Signal fort: MA20 proche de Bollinger basse`)
    } else if (combo20 >= 0.92) {
      signalStrength += 15
      arguments_array.push(`⚠️ COMBO20 = ${combo20.toFixed(4)} - Signal modéré`)
    }

    if (combo50 >= 0.95) {
      signalStrength += 30
      arguments_array.push(`🎯 COMBO50 = ${combo50.toFixed(4)} - Tendance long terme favorable`)
    } else if (combo50 >= 0.90) {
      signalStrength += 20
      arguments_array.push(`✅ COMBO50 = ${combo50.toFixed(4)} - Tendance long terme acceptable`)
    }

    if (currentPrice <= bollingerLower * 1.02) {
      signalStrength += 20
      arguments_array.push(`💰 Prix actuel (${currentPrice.toFixed(2)}) proche/sous Bollinger basse (${bollingerLower.toFixed(2)}) - Zone de survente`)
    }

    if (currentPrice < ma20 && currentPrice < ma50) {
      signalStrength += 10
      arguments_array.push(`📉 Prix sous MA20 et MA50 - Potentiel de rebond`)
    }

    const bollingerWidth = ((bollingerUpper - bollingerLower) / bollingerMiddle) * 100
    if (bollingerWidth < 10) {
      signalStrength += 5
      arguments_array.push(`📊 Bandes de Bollinger resserrées (${bollingerWidth.toFixed(1)}%) - Volatilité faible, mouvement imminent`)
    }

    if (signalStrength >= 80) {
      recommendation = 'STRONG_BUY'
      arguments_array.unshift(`🚀 SIGNAL D'ACHAT TRÈS FORT (${signalStrength}/100)`)
    } else if (signalStrength >= 60) {
      recommendation = 'BUY'
      arguments_array.unshift(`📈 Signal d'achat fort (${signalStrength}/100)`)
    } else if (signalStrength >= 40) {
      recommendation = 'HOLD'
      arguments_array.unshift(`⏸️ Signal modéré (${signalStrength}/100) - Observer`)
    } else {
      recommendation = 'WAIT'
      arguments_array.unshift(`⏳ Signal faible (${signalStrength}/100) - Attendre`)
    }

    arguments_array.push(`\n📊 Données techniques:`)
    arguments_array.push(`- Prix actuel: ${currentPrice.toFixed(2)}`)
    arguments_array.push(`- MA20: ${ma20.toFixed(2)}`)
    arguments_array.push(`- MA50: ${ma50.toFixed(2)}`)
    arguments_array.push(`- Bollinger Sup: ${bollingerUpper.toFixed(2)}`)
    arguments_array.push(`- Bollinger Mid: ${bollingerMiddle.toFixed(2)}`)
    arguments_array.push(`- Bollinger Inf: ${bollingerLower.toFixed(2)}`)

    return {
      ...indicators,
      combo20,
      combo50,
      signalStrength,
      recommendation,
      arguments: arguments_array.join('\n'),
    }
  }

  async analyzeAsset(symbol: string): Promise<ComboIndicators | null> {
    const indicators = await this.getTechnicalIndicators(symbol)
    if (!indicators) return null

    return this.calculateComboIndicators(indicators)
  }
}

export const tradingViewService = new TradingViewService()
