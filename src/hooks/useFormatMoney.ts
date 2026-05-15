import { useSettingsStore } from '../store'
import { useExchangeRates } from './useExchangeRates'
import { convertAmount, formatMoney } from '../lib/currencies'

export function useFormatMoney() {
  const { settings } = useSettingsStore()
  const rates = useExchangeRates()
  const displayCurrency = settings.displayCurrency || settings.baseCurrency

  function fmt(amount: number, fromCurrency?: string): string {
    const from = fromCurrency ?? settings.baseCurrency
    if (from === displayCurrency) return formatMoney(amount, displayCurrency)
    return formatMoney(convertAmount(amount, from, displayCurrency, rates), displayCurrency)
  }

  return { fmt, displayCurrency, rates }
}
