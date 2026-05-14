import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSettingsStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { FALLBACK_RATES } from '../../lib/currencies'

export function RatesManager() {
  const { settings, updateRateCache } = useSettingsStore()
  const [refreshing, setRefreshing] = useState(false)

  const cache = settings.rateCache
  const lastUpdated = cache
    ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
        -Math.round((Date.now() - new Date(cache.fetchedAt).getTime()) / 60000),
        'minute',
      )
    : 'Never'

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = (await r.json()) as { rates: Record<string, number> }
      updateRateCache({ base: 'USD', rates: data.rates, fetchedAt: new Date().toISOString() })
    } catch {
      updateRateCache({ base: 'USD', rates: FALLBACK_RATES, fetchedAt: new Date().toISOString() })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exchange Rates</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {cache ? `Last updated: ${lastUpdated}` : 'Using fallback rates'}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleRefresh} loading={refreshing}>
        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
        Refresh
      </Button>
    </div>
  )
}
