'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PositionModalProps {
  notification: any
  onClose: () => void
  onSubmit: (data: any) => void
}

export function PositionModal({ notification, onClose, onSubmit }: PositionModalProps) {
  const [entryPrice, setEntryPrice] = useState(notification.currentPrice.toString())
  const [investedAmount, setInvestedAmount] = useState(notification.suggestedAmount?.toString() || '100')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const price = parseFloat(entryPrice)
    const amount = parseFloat(investedAmount)
    const quantity = amount / price

    onSubmit({
      notificationId: notification.id,
      entryPrice: price,
      quantity,
      investedAmount: amount,
      entryDate: new Date().toISOString(),
      notes,
    })
  }

  const calculatedQuantity = parseFloat(investedAmount) / parseFloat(entryPrice)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Enregistrer la position</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              {notification.asset.name} ({notification.asset.symbol})
            </h3>
            <p className="text-sm text-blue-700">
              Prix suggéré: {formatCurrency(notification.currentPrice)}
            </p>
            {notification.suggestedAmount && (
              <p className="text-sm text-blue-700">
                Montant suggéré: {formatCurrency(notification.suggestedAmount)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix d'entrée (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Montant investi (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {!isNaN(calculatedQuantity) && calculatedQuantity > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Quantité calculée:</p>
                <p className="text-lg font-bold text-gray-900">
                  {calculatedQuantity.toFixed(6)} unités
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajoutez des notes sur cette entrée..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              ✅ Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
