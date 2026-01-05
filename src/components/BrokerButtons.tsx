'use client'

import { ExternalLink } from 'lucide-react'

interface BrokerButtonsProps {
  assetSymbol: string
}

export function BrokerButtons({ assetSymbol }: BrokerButtonsProps) {
  const brokers = [
    {
      name: 'Trade Republic',
      url: `https://traderepublic.com/search?q=${assetSymbol}`,
      logo: '🇩🇪',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700',
    },
    {
      name: 'Interactive Brokers',
      url: `https://www.interactivebrokers.com/`,
      logo: '🌐',
      color: 'bg-gradient-to-r from-gray-700 to-gray-800',
    },
    {
      name: 'Degiro',
      url: `https://www.degiro.com/`,
      logo: '🇳🇱',
      color: 'bg-gradient-to-r from-red-600 to-red-700',
    },
    {
      name: 'eToro',
      url: `https://www.etoro.com/discover/markets/stocks/${assetSymbol}`,
      logo: '💹',
      color: 'bg-gradient-to-r from-green-600 to-green-700',
    },
  ]

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        🏦 Acheter sur votre broker préféré:
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {brokers.map((broker) => (
          <a
            key={broker.name}
            href={broker.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${broker.color} text-white px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <span>{broker.logo}</span>
            <span className="hidden sm:inline">{broker.name}</span>
            <ExternalLink size={14} />
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3 text-center">
        💡 Ces liens sont des affiliations. En utilisant ces liens, vous soutenez GTI sans frais supplémentaires.
      </p>
    </div>
  )
}
