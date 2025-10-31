export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // >= 1
  start: Date;
  until: Date;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function computeRecurringDates(rule: RecurrenceRule): Date[] {
  const { type, interval, start, until } = rule;
  if (interval < 1) throw new Error('interval must be >= 1');
  const results: Date[] = [];

  const pushIfInRange = (d: Date | null) => {
    if (!d) return;
    if (d >= start && d <= until) results.push(new Date(d));
  };

  // include start if in range
  pushIfInRange(start);

  if (type === 'daily' || type === 'weekly') {
    let cursor = new Date(start);
    while (true) {
      const next = type === 'daily' ? addDays(cursor, interval) : addWeeks(cursor, interval);
      if (next > until) break;
      results.push(new Date(next));
      cursor = next;
    }
  } else if (type === 'monthly') {
    const day = start.getDate();
    let year = start.getFullYear();
    let month = start.getMonth();
    while (true) {
      // advance logical month by interval
      month += interval;
      year += Math.floor(month / 12);
      month = ((month % 12) + 12) % 12;
      const candidate = new Date(year, month, day);
      if (candidate > until) break;
      // valid only if JS did not roll over the month (i.e., day exists in that month)
      if (candidate.getMonth() === month) {
        results.push(candidate);
      }
    }
  } else if (type === 'yearly') {
    const month = start.getMonth();
    const day = start.getDate();
    let year = start.getFullYear();
    while (true) {
      year += interval;
      const candidate = new Date(year, month, day);
      if (candidate > until) break;
      // Skip invalid Feb 29 on non-leap years
      if (month === 1 && day === 29 && !isLeapYear(year)) {
        continue;
      }
      if (candidate.getMonth() === month) {
        results.push(candidate);
      }
    }
  }

  return results;
}
