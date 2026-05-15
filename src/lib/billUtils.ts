import { format, parseISO, addDays, addMonths, addYears } from 'date-fns'
import { useBillsStore } from '../store/billsSlice'
import { useTransactionsStore } from '../store/transactionsSlice'
import * as db from './db'
import type { Frequency, Settings, Transaction } from '../types'

export function advanceByFrequency(dateStr: string, freq: Frequency): string {
  const d = parseISO(dateStr)
  const next =
    freq === 'weekly' ? addDays(d, 7)
    : freq === 'monthly' ? addMonths(d, 1)
    : addYears(d, 1)
  return format(next, 'yyyy-MM-dd')
}

export async function processDueBills(settings: Settings): Promise<void> {
  const { bills, updateBill } = useBillsStore.getState()
  const { addTransaction } = useTransactionsStore.getState()
  const today = new Date().toISOString().slice(0, 10)

  for (const bill of [...bills]) {
    let currentDue = bill.nextDueDate

    while (currentDue <= today) {
      if (bill.endDate && currentDue > bill.endDate) break

      const nextDue = advanceByFrequency(currentDue, bill.frequency)

      // Advance date FIRST — prevents duplicate transaction if write fails
      updateBill(bill.id, { nextDueDate: nextDue })
      void db.updateBill(bill.id, { nextDueDate: nextDue })

      const isPercent = bill.percentOfIncome != null && bill.percentOfIncome > 0
      const t: Transaction = {
        id: crypto.randomUUID(),
        date: currentDue,
        description: bill.name,
        amount: isPercent
          ? (settings.monthlyIncome * (bill.percentOfIncome ?? 0)) / 100
          : bill.amount,
        type: 'expense',
        category: bill.category,
        currency: isPercent ? settings.baseCurrency : bill.currency,
        note: bill.note,
        createdAt: new Date().toISOString(),
      }
      addTransaction(t)
      void db.insertTransaction(t)

      currentDue = nextDue
      if (bill.endDate && nextDue > bill.endDate) break
    }
  }
}
