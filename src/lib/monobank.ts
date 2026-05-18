const BASE_URL = 'https://api.monobank.ua'

export const MONO_CURRENCY_MAP: Record<number, string> = {
  980: 'UAH',
  840: 'USD',
  978: 'EUR',
  826: 'GBP',
  985: 'PLN',
  756: 'CHF',
  643: 'RUB',
  392: 'JPY',
  36: 'AUD',
  124: 'CAD',
  208: 'DKK',
  752: 'SEK',
  578: 'NOK',
  203: 'CZK',
  348: 'HUF',
}

export function monoCurrencyToIso(code: number): string {
  return MONO_CURRENCY_MAP[code] ?? 'UAH'
}

export interface MonoAccount {
  id: string
  currencyCode: number
  maskedPan: string[]
  type: string
  balance: number
  creditLimit: number
}

export interface MonoStatement {
  id: string
  time: number
  description: string
  mcc: number
  originalMcc: number
  amount: number
  operationAmount: number
  currencyCode: number
  commissionRate: number
  cashbackAmount: number
  balance: number
  hold: boolean
  comment?: string
}

async function monoFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Token': token },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Monobank API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function fetchMonoClientInfo(token: string): Promise<MonoAccount[]> {
  const data = await monoFetch<{ accounts: MonoAccount[] }>(token, '/personal/client-info')
  return data.accounts
}

export async function fetchMonoStatement(
  token: string,
  account: string,
  from: Date,
  to: Date,
): Promise<MonoStatement[]> {
  const fromTs = Math.floor(from.getTime() / 1000)
  const toTs = Math.floor(to.getTime() / 1000)
  return monoFetch<MonoStatement[]>(token, `/personal/statement/${account}/${fromTs}/${toTs}`)
}
