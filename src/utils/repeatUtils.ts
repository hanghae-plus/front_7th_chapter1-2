// Utilities for handling repeat date calculations
export function expandMonthlyDates(startDate: string, count: number): string[] {
  const res: string[] = []
  const start = new Date(startDate + 'T00:00:00')

  for (let i = 1; i <= count; i++) {
    const next = addMonthsPreserveDay(start, i)
    res.push(formatISODate(next))
  }
  return res
}

function formatISODate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function addMonthsPreserveDay(date: Date, months: number) {
  const day = date.getDate()
  const y = date.getFullYear()
  const m = date.getMonth()
  const targetMonthIndex = m + months
  const tentative = new Date(y, targetMonthIndex, day)
  if (tentative.getDate() !== day) {
    // overflowed, use last day of target month
    return new Date(y, targetMonthIndex + 1, 0)
  }
  return tentative
}
