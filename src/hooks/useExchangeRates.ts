import { useEffect, useState } from 'react'
import { FALLBACK_RATES } from '../lib/currencies'
import { useSettingsStore } from '../store'

const ONE_HOUR_MS = 60 * 60 * 1000

export function useExchangeRates(): Record<string, number> {
  const { settings, updateRateCache } = useSettingsStore()
  const [rates, setRates] = useState<Record<string, number>>(
    settings.rateCache?.rates ?? FALLBACK_RATES,
  )

  useEffect(() => {
    const cache = settings.rateCache
    const age = cache ? Date.now() - new Date(cache.fetchedAt).getTime() : Infinity

    if (age < ONE_HOUR_MS && cache) {
      setRates(cache.rates)
      return
    }

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data: { rates: Record<string, number> }) => {
        const newRates = data.rates
        setRates(newRates)
        updateRateCache({ base: 'USD', rates: newRates, fetchedAt: new Date().toISOString() })
      })
      .catch(() => {
        setRates(FALLBACK_RATES)
      })
  }, [])

  return rates
}
