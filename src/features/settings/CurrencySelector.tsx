import { CURRENCY_LIST } from '../../lib/currencies'
import { Select } from '../../components/ui/Select'

interface CurrencySelectorProps {
  value: string
  onChange: (code: string) => void
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label="Base Currency"
      hint="All totals are converted to this currency"
    >
      {CURRENCY_LIST.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name} ({c.symbol})
        </option>
      ))}
    </Select>
  )
}
