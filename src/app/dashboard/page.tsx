'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, Settings, BarChart3, Bell, RefreshCw } from 'lucide-react'
import { NotificationCard } from '@/components/NotificationCard'
import { PositionModal } from '@/components/PositionModal'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED'>('ALL')
  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    },
  })

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await fetch('/api/positions')
      if (!res.ok) throw new Error('Failed to fetch positions')
      return res.json()
    },
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })

  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, status, viewed: true }),
      })
      if (!res.ok) throw new Error('Failed to update notification')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const createPositionMutation = useMutation({
    mutationFn: async (positionData: any) => {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(positionData),
      })
      if (!res.ok) throw new Error('Failed to create position')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setSelectedNotification(null)
    },
  })

  const triggerScanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: prompt('Entrez le secret CRON:') }),
      })
      if (!res.ok) throw new Error('Scan failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      alert('Scan terminé avec succès!')
    },
  })

  const notifications = notificationsData?.notifications || []
  const positions = positionsData?.positions || []
  const settings = settingsData?.settings

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'ALL') return true
    if (filter === 'PENDING') return n.status === 'PENDING'
    if (filter === 'EXECUTED') return n.status === 'EXECUTED'
    return true
  })

  const openPositions = positions.filter((p: any) => p.status === 'OPEN')
  const totalInvested = openPositions.reduce((sum: number, p: any) => sum + p.investedAmount, 0)

  const budgetUsageMonth = settings ? (settings.currentMonthSpent / settings.monthlyMaxBudget) * 100 : 0
  const budgetUsageYear = settings ? (settings.currentYearSpent / settings.annualBudget) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GTI</h1>
                <p className="text-sm text-gray-600">Good Time Investment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => triggerScanMutation.mutate()}
                disabled={triggerScanMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={triggerScanMutation.isPending ? 'animate-spin' : ''} />
                Scan manuel
              </button>
              <a
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Settings size={18} />
                Paramètres
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Budget Mensuel</h3>
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(settings?.currentMonthSpent || 0)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(budgetUsageMonth, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {budgetUsageMonth.toFixed(0)}% de {formatCurrency(settings?.monthlyMaxBudget || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Budget Annuel</h3>
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(settings?.currentYearSpent || 0)}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(budgetUsageYear, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {budgetUsageYear.toFixed(0)}% de {formatCurrency(settings?.annualBudget || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Positions Ouvertes</h3>
              <Bell size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{openPositions.length}</p>
            <p className="text-sm text-gray-600 mt-2">
              Total investi: {formatCurrency(totalInvested)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                En attente ({notifications.filter((n: any) => n.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setFilter('EXECUTED')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'EXECUTED'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Exécutées ({notifications.filter((n: any) => n.status === 'EXECUTED').length})
              </button>
            </div>
          </div>
        </div>

        {notificationsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-600">
              Les opportunités d'investissement apparaîtront ici lorsque les conditions seront réunies.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNotifications.map((notification: any) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onStatusUpdate={(id, status) =>
                  updateNotificationMutation.mutate({ id, status })
                }
                onCreatePosition={(notif) => setSelectedNotification(notif)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedNotification && (
        <PositionModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onSubmit={(data) => createPositionMutation.mutate(data)}
        />
      )}
    </div>
  )
}
