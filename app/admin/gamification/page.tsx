'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AdminLayout } from '@/components/AdminLayout'
import { GamificationPageSkeleton } from '@/components/ui/Skeleton'
import { useI18n } from '@/lib/i18n/context'

interface LeaderboardEntry {
  email: string
  xp: number
  level: number
  lastReason: string | null
}

interface BTCLeaderboardEntry {
  email: string
  btc: number
  lastReason: string | null
}

export default function GamificationPage() {
  const [xpLeaderboard, setXpLeaderboard] = useState<LeaderboardEntry[]>([])
  const [btcLeaderboard, setBtcLeaderboard] = useState<BTCLeaderboardEntry[]>([])
  const [wallet, setWallet] = useState({ btc: 0, xp: 0, level: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userDataRaw } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', user.id)
        .single()

      const userData = userDataRaw as { role: 'Admin' | 'Teacher' | 'Student'; email: string } | null

      if (!userData || userData.role !== 'Admin') {
        router.push('/')
        return
      }

      setCurrentUserEmail(userData.email)
      loadData()
    }

    checkAuth()
  }, [router])

  async function loadData() {
    try {
      const [xpRes, btcRes, walletRes] = await Promise.all([
        fetch('/api/gamification/leaderboard'),
        fetch('/api/gamification/btc-leaderboard'),
        fetch('/api/gamification/wallet'),
      ])

      const [xpData, btcData, walletData] = await Promise.all([
        xpRes.json(),
        btcRes.json(),
        walletRes.json(),
      ])

      if (xpData.success) setXpLeaderboard(xpData.data || [])
      if (btcData.success) setBtcLeaderboard(btcData.data || [])
      if (walletData.success) setWallet(walletData.data || { btc: 0, xp: 0, level: 1 })
    } catch (err) {
      console.error('Failed to load gamification data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function getMedal(index: number) {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return index + 1
  }

  return (
    <AdminLayout isLoading={isLoading} skeleton={<GamificationPageSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-50 mb-8">🏆 {t('admin.gamification.xpLeaderboard')}</h2>
        <Card className="mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.user')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.xp')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.level')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.progress')}</th>
                </tr>
              </thead>
              <tbody>
                {xpLeaderboard.map((entry, index) => {
                  const progress = entry.xp % 100
                  const isMe = entry.email === currentUserEmail
                  return (
                    <tr
                      key={entry.email}
                      className={`border-b border-white/5 ${isMe ? 'bg-blue-900/30 font-semibold' : ''}`}
                    >
                      <td className="py-3 px-4 font-bold text-primary-500">{getMedal(index)}</td>
                      <td className="py-3 px-4 text-slate-200">{entry.email}</td>
                      <td className="py-3 px-4 text-slate-200">{entry.xp}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm font-bold">
                          {t('admin.gamification.lvl')} {entry.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="text-2xl font-bold text-slate-50 mb-8">{t('admin.gamification.btcLeaderboard')}</h2>
        <Card className="mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.user')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">{t('admin.gamification.btc')}</th>
                </tr>
              </thead>
              <tbody>
                {btcLeaderboard.map((entry, index) => (
                  <tr key={entry.email} className="border-b border-white/5">
                    <td className="py-3 px-4 text-slate-200">{index + 1}</td>
                    <td className="py-3 px-4 text-slate-200">{entry.email}</td>
                    <td className="py-3 px-4 font-mono font-bold text-orange-600">
                      {entry.btc.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="text-2xl font-bold text-slate-50 mb-8">👤 {t('admin.gamification.myBtcWallet')}</h2>
        <Card className="mb-12">
          <p>
            <strong>{t('admin.gamification.balance')}:</strong>{' '}
            <span className="font-mono font-bold text-orange-600">{wallet.btc.toFixed(6)} {t('admin.gamification.btc')}</span>
          </p>
          <p className="mt-2">
            <strong>{t('admin.gamification.xp')}:</strong> {wallet.xp} | <strong>{t('admin.gamification.level')}:</strong> {wallet.level}
          </p>
        </Card>

        <h2 className="text-2xl font-bold text-slate-50 mb-8">⛪ {t('admin.gamification.churchTreasury')}</h2>
        <Card className="mb-12">
          <p>
            <strong>{t('admin.gamification.totalChurchBtc')}:</strong>{' '}
            <span className="font-mono font-bold text-orange-600">
              {btcLeaderboard.reduce((sum, e) => sum + e.btc, 0).toFixed(6)} {t('admin.gamification.btc')}
            </span>
          </p>
        </Card>

        <h2 className="text-2xl font-bold text-slate-50 mb-8">{t('admin.gamification.halvingEvent')}</h2>
        <Card>
          <p>{t('admin.gamification.nextHalving')}</p>
          <strong className="text-lg">
            {new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toLocaleDateString()}
          </strong>
        </Card>

        <Card className="mt-8">
          <p className="text-sm text-gray-600 mb-4">
            {t('admin.gamification.simulationOnly')}
          </p>
          <button
            onClick={() => setShowRedeemModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t('admin.gamification.redeemBtc')}
          </button>
        </Card>

        <Modal
          isOpen={showRedeemModal}
          onClose={() => setShowRedeemModal(false)}
          title={t('admin.gamification.redemptionSuccessful')}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-slate-200 text-lg mb-6">
              {t('admin.gamification.redeemSimulated')}
            </p>
            <p className="text-slate-400 text-sm mb-6">
              {t('admin.gamification.simulationNote')}
            </p>
            <Button
              onClick={() => setShowRedeemModal(false)}
              variant="primary"
              className="w-full"
            >
              {t('admin.gamification.close')}
            </Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

