'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })

  const { data: assetsData } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await fetch('/api/assets')
      if (!res.ok) throw new Error('Failed to fetch assets')
      return res.json()
    },
  })

  const [formData, setFormData] = useState<any>(null)
  const [newAsset, setNewAsset] = useState({ symbol: '', name: '', assetType: '' })

  if (settingsData && !formData) {
    setFormData(settingsData.settings)
  }

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      alert('Paramètres sauvegardés avec succès!')
    },
  })

  const createAssetMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create asset')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setNewAsset({ symbol: '', name: '', assetType: '' })
    },
  })

  const toggleAssetMutation = useMutation({
    mutationFn: async ({ assetId, active }: { assetId: string; active: boolean }) => {
      const res = await fetch('/api/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, active }),
      })
      if (!res.ok) throw new Error('Failed to update asset')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettingsMutation.mutate(formData)
  }

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault()
    createAssetMutation.mutate(newAsset)
  }

  const assets = assetsData?.assets || []

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Gestion du Budget</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget annuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.annualBudget}
                  onChange={(e) => setFormData({ ...formData, annualBudget: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget mensuel max (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyMaxBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyMaxBudget: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Taille max de position (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxPositionSize}
                  onChange={(e) => setFormData({ ...formData, maxPositionSize: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Critères de Signal</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  COMBO20 minimum
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.minCombo20}
                  onChange={(e) => setFormData({ ...formData, minCombo20: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Défaut: 0.95</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  COMBO50 minimum
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.minCombo50}
                  onChange={(e) => setFormData({ ...formData, minCombo50: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Défaut: 0.92</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Force de signal minimum
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.minSignalStrength}
                  onChange={(e) => setFormData({ ...formData, minSignalStrength: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Défaut: 70/100</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📧 Notifications</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-semibold">
                Recevoir des notifications par email
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {updateSettingsMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </button>
        </form>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Actifs suivis</h2>

          <div className="space-y-3 mb-6">
            {assets.map((asset: any) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-600">
                    {asset.symbol} • {asset.assetType}
                  </p>
                </div>
                <button
                  onClick={() => toggleAssetMutation.mutate({
                    assetId: asset.id,
                    active: !asset.active,
                  })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    asset.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {asset.active ? (
                    <>
                      <ToggleRight size={20} />
                      Actif
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={20} />
                      Inactif
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAsset} className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ajouter un actif</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Symbole (ex: SPX)"
                value={newAsset.symbol}
                onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Nom (ex: S&P 500)"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Type (ex: INDEX)"
                value={newAsset.assetType}
                onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createAssetMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={20} />
              Ajouter
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
