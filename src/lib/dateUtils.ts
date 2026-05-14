import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  isToday,
  isTomorrow,
} from 'date-fns'

export function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return isoDate(new Date())
}

export function formatDate(isoDateStr: string): string {
  try {
    return format(parseISO(isoDateStr), 'MMM d, yyyy')
  } catch {
    return isoDateStr
  }
}

export function formatDateShort(isoDateStr: string): string {
  try {
    return format(parseISO(isoDateStr), 'MMM d')
  } catch {
    return isoDateStr
  }
}

export function formatMonth(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy')
}

export function getDaysRemaining(isoDateStr: string): number {
  try {
    const target = parseISO(isoDateStr)
    return differenceInDays(target, new Date())
  } catch {
    return 0
  }
}

export function getDaysElapsedInMonth(): number {
  return new Date().getDate()
}

export function getDaysInCurrentMonth(): number {
  return getDaysInMonth(new Date())
}

export function isWithinDays(isoDateStr: string, days: number): boolean {
  try {
    const target = parseISO(isoDateStr)
    const today = new Date()
    const cutoff = addDays(today, days)
    return target >= today && target <= cutoff
  } catch {
    return false
  }
}

export function formatRelativeDate(isoDateStr: string): string {
  try {
    const date = parseISO(isoDateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    const days = differenceInDays(date, new Date())
    if (days > 0 && days <= 6) return `In ${days} days`
    if (days < 0) return `${Math.abs(days)} days ago`
    return format(date, 'MMM d')
  } catch {
    return isoDateStr
  }
}

export function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month, 1)
  return { start: startOfMonth(date), end: endOfMonth(date) }
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 0) return { year: year - 1, month: 11 }
  return { year, month: month - 1 }
}
