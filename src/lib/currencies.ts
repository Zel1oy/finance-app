export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
}

export const CURRENCY_LIST: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
]

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  UAH: 41.5,
  PLN: 3.98,
  CHF: 0.89,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  SEK: 10.3,
  NOK: 10.7,
  DKK: 6.88,
  CZK: 23.1,
  HUF: 357,
  BRL: 4.97,
  MXN: 17.15,
  SGD: 1.34,
  HKD: 7.82,
  INR: 83.5,
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount
  const fromRate = rates[fromCurrency] ?? FALLBACK_RATES[fromCurrency] ?? 1
  const toRate = rates[toCurrency] ?? FALLBACK_RATES[toCurrency] ?? 1
  return (amount / fromRate) * toRate
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'HUF' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'HUF' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatMoneyCompact(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return `${amount.toFixed(0)} ${currency}`
  }
}

export function getCurrencySymbol(currency: string): string {
  const found = CURRENCY_LIST.find((c) => c.code === currency)
  return found?.symbol ?? currency
}
