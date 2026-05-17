import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react'
import { differenceInMonths, addMonths, format, parseISO } from 'date-fns'
import { useBillsStore, useSettingsStore } from '../../store'
import { useFormatMoney } from '../../hooks/useFormatMoney'
import { cn } from '../../lib/utils'
import type { Bill } from '../../types'

function monthlyPayment(bill: Bill, monthlyIncome: number): number {
  return bill.percentOfIncome != null && bill.percentOfIncome > 0
    ? (monthlyIncome * bill.percentOfIncome) / 100
    : bill.amount
}

function monthsLeft(bill: Bill): number {
  return Math.max(1, differenceInMonths(parseISO(bill.endDate!), new Date()))
}

interface SnowballRow {
  billId: string
  name: string
  payment: number
  originalMonths: number
  snowballMonth: number
}

function runSnowball(bills: Bill[], monthlyIncome: number, extra: number): SnowballRow[] {
  const items = bills
    .map(b => ({ bill: b, payment: monthlyPayment(b, monthlyIncome), months: monthsLeft(b) }))
    .sort((a, b) => a.months - b.months)

  let accumulated = extra
  let prevPayoff = 0
  const rows: SnowballRow[] = []

  for (const { bill, payment, months } of items) {
    const balance = payment * months
    const alreadyPaid = Math.min(balance, prevPayoff * payment)
    const remaining = balance - alreadyPaid

    const snowballMonth =
      remaining <= 0
        ? prevPayoff
        : prevPayoff + Math.ceil(remaining / (payment + accumulated))

    accumulated += payment
    prevPayoff = snowballMonth
    rows.push({ billId: bill.id, name: bill.name, payment, originalMonths: months, snowballMonth })
  }

  return rows
}

export function LoanPayoffCalculator() {
  const { bills } = useBillsStore()
  const { settings } = useSettingsStore()
  const { fmt } = useFormatMoney()

  const [isOpen, setIsOpen] = useState(false)
  const [extra, setExtra] = useState(0)
  // Store unchecked ids — new eligible bills are checked by default
  const [uncheckedIds, setUncheckedIds] = useState<Set<string>>(new Set())

  const eligibleBills = useMemo(
    () => bills.filter(b => b.endDate && b.nextDueDate <= b.endDate),
    [bills],
  )
  const ongoingCount = useMemo(
    () => bills.filter(b => !b.endDate).length,
    [bills],
  )

  function toggle(id: string) {
    setUncheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selected = eligibleBills.filter(b => !uncheckedIds.has(b.id))

  const results = useMemo(
    () => runSnowball(selected, settings.monthlyIncome, extra),
    [selected, settings.monthlyIncome, extra],
  )

  const originalTotal = results.reduce((m, r) => Math.max(m, r.originalMonths), 0)
  const snowballTotal = results.reduce((m, r) => Math.max(m, r.snowballMonth), 0)
  const saved = originalTotal - snowballTotal

  const collapsedLabel =
    eligibleBills.length === 0
      ? 'Add bills with a fixed duration to use this'
      : selected.length === 0
      ? `${eligibleBills.length} loan${eligibleBills.length !== 1 ? 's' : ''} available — select to calculate`
      : saved > 0
      ? `${selected.length} loan${selected.length !== 1 ? 's' : ''} · ${originalTotal} mo → ${snowballTotal} mo with snowball`
      : `${selected.length} loan${selected.length !== 1 ? 's' : ''} · paid off in ${originalTotal} months`

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
            <Calculator size={15} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Loan Payoff Calculator</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{collapsedLabel}</p>
          </div>
        </div>
        {isOpen
          ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 pt-4 pb-5 flex flex-col gap-4">
          {eligibleBills.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
              Add recurring bills with a <span className="font-medium text-gray-500 dark:text-gray-400">Fixed duration</span> to use this calculator.
            </p>
          ) : (
            <>
              {/* Bill selection list */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                  Select loans to include
                </p>
                {eligibleBills.map(bill => {
                  const payment = monthlyPayment(bill, settings.monthlyIncome)
                  const months = monthsLeft(bill)
                  const checked = !uncheckedIds.has(bill.id)
                  return (
                    <label
                      key={bill.id}
                      className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(bill.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 flex-shrink-0"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {bill.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                        {fmt(payment)}/mo
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-16 text-right">
                        {months} mo left
                      </span>
                    </label>
                  )
                })}
                {ongoingCount > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 px-2 pt-1">
                    {ongoingCount} ongoing bill{ongoingCount !== 1 ? 's' : ''} without a fixed duration — set one to include
                  </p>
                )}
              </div>

              {/* Extra payment input */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                  Extra monthly payment
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {settings.displayCurrency || settings.baseCurrency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={extra || ''}
                    placeholder="0"
                    onChange={e => setExtra(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-900"
                  />
                </div>
              </div>

              {/* Results table */}
              {selected.length > 0 ? (
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="grid grid-cols-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    <span>Loan</span>
                    <span className="text-center">As scheduled</span>
                    <span className="text-center">With snowball{extra > 0 ? ' + extra' : ''}</span>
                  </div>
                  {results.map(r => {
                    const rowSaved = r.originalMonths - r.snowballMonth
                    const origDate = format(addMonths(new Date(), r.originalMonths), 'MMM yyyy')
                    const snowDate = format(addMonths(new Date(), r.snowballMonth), 'MMM yyyy')
                    return (
                      <div
                        key={r.billId}
                        className="grid grid-cols-3 px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 items-center"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                          {r.name}
                        </span>
                        <div className="text-center">
                          <p className="text-sm tabular-nums text-gray-600 dark:text-gray-400">{r.originalMonths} mo</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{origDate}</p>
                        </div>
                        <div className="text-center">
                          <p className={cn('text-sm tabular-nums font-semibold', rowSaved > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400')}>
                            {r.snowballMonth} mo
                          </p>
                          <p className={cn('text-xs', rowSaved > 0 ? 'text-emerald-500 dark:text-emerald-500 font-medium' : 'text-gray-400 dark:text-gray-500')}>
                            {rowSaved > 0 ? `−${rowSaved} mo` : snowDate}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {/* Total row */}
                  <div className="grid grid-cols-3 px-3 py-3 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 items-center">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">All paid off</span>
                    <p className="text-center text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                      {originalTotal} mo
                    </p>
                    <div className="text-center">
                      <p className={cn('text-sm font-bold tabular-nums', saved > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300')}>
                        {snowballTotal} mo
                      </p>
                      {saved > 0 && (
                        <p className="text-xs text-emerald-500 font-semibold">{saved} mo sooner 🎉</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                  Check at least one loan above to see the payoff timeline.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
