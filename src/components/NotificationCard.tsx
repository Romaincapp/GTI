'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { BrokerButtons } from './BrokerButtons'

interface NotificationCardProps {
  notification: any
  onStatusUpdate: (id: string, status: string) => void
  onCreatePosition: (notification: any) => void
}

export function NotificationCard({
  notification,
  onStatusUpdate,
  onCreatePosition,
}: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'BUY':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'HOLD':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return '🚀'
      case 'BUY':
        return '📈'
      case 'HOLD':
        return '⏸️'
      default:
        return '⏳'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✅ Exécuté</span>
      case 'APPROVED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">👍 Approuvé</span>
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">❌ Rejeté</span>
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⏳ En attente</span>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {notification.asset.name}
              <span className="ml-2 text-sm text-gray-500">({notification.asset.symbol})</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(notification.status)}
            {notification.emailSent && (
              <span className="text-xs text-gray-500">📧 Email envoyé</span>
            )}
          </div>
        </div>

        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-4',
          getRecommendationColor(notification.recommendation)
        )}>
          <span className="text-2xl">{getRecommendationIcon(notification.recommendation)}</span>
          <span className="font-bold">{notification.recommendation.replace('_', ' ')}</span>
          <span className="ml-2 font-semibold">Force: {notification.signalStrength}/100</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Prix actuel</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(notification.currentPrice)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">COMBO20</p>
            <p className="text-lg font-bold text-blue-900">{notification.combo20.toFixed(4)}</p>
            {notification.combo20 >= 0.98 && <span className="text-xs text-green-600">🎯 Excellent</span>}
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">COMBO50</p>
            <p className="text-lg font-bold text-purple-900">{notification.combo50.toFixed(4)}</p>
            {notification.combo50 >= 0.95 && <span className="text-xs text-green-600">🎯 Excellent</span>}
          </div>
          {notification.suggestedAmount && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Montant suggéré</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(notification.suggestedAmount)}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2"
        >
          {isExpanded ? '▼ Masquer l\'analyse' : '▶ Voir l\'analyse complète'}
        </button>

        {isExpanded && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2">🎯 Analyse détaillée:</h4>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {notification.arguments}
            </pre>
          </div>
        )}

        {notification.position && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Position ouverte</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Prix d'entrée:</span>
                <span className="ml-2 font-semibold">{formatCurrency(notification.position.entryPrice)}</span>
              </div>
              <div>
                <span className="text-gray-600">Montant investi:</span>
                <span className="ml-2 font-semibold">{formatCurrency(notification.position.investedAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {notification.status === 'PENDING' && (
          <>
            <BrokerButtons assetSymbol={notification.asset.symbol} />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onCreatePosition(notification)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                ✅ Valider l'entrée
              </button>
              <button
                onClick={() => onStatusUpdate(notification.id, 'REJECTED')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                ❌ Rejeter
              </button>
            </div>
          </>
        )}

        {notification.status === 'APPROVED' && !notification.position && (
          <>
            <BrokerButtons assetSymbol={notification.asset.symbol} />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onCreatePosition(notification)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                📊 Enregistrer la position
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
