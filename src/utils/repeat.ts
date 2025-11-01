import { Event } from '../types';

const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, days: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
};

const addMonths = (d: Date, months: number) => {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + months);
  return nd;
};

const addYears = (d: Date, years: number) => {
  const nd = new Date(d);
  nd.setFullYear(nd.getFullYear() + years);
  return nd;
};

const formatISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function getExceptionsSet(repeat: Event['repeat']): Set<string> {
  return new Set((repeat.exceptions ?? []).map((s) => s.trim()));
}

const isLeapYear = (year: number): boolean => {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const monthHasDay = (date: Date, day: number) => {
  const dim = getDaysInMonth(date.getFullYear(), date.getMonth() + 1);
  return day >= 1 && day <= dim;
};

function generateDaily(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const occurrences: Event[] = [];
  const interval = Math.max(1, event.repeat.interval);
  const start = toDateOnly(new Date(event.date));
  const until = event.repeat.endDate ? toDateOnly(new Date(event.repeat.endDate)) : rangeEnd;
  const exceptionsSet = getExceptionsSet(event.repeat);

  for (let d = start; d <= until && d <= rangeEnd; d = addDays(d, interval)) {
    if (d < rangeStart) continue;
    const dateStr = formatISODate(d);
    if (exceptionsSet.has(dateStr)) continue;
    occurrences.push({ ...event, id: `${event.id || 'new'}@${dateStr}`, date: dateStr });
  }
  return occurrences;
}

function generateWeekly(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const occurrences: Event[] = [];
  const intervalWeeks = Math.max(1, event.repeat.interval);
  const start = toDateOnly(new Date(event.date));
  const startDow = start.getDay();
  const until = event.repeat.endDate ? toDateOnly(new Date(event.repeat.endDate)) : rangeEnd;
  const exceptionsSet = getExceptionsSet(event.repeat);

  // Align to first occurrence (start itself)
  for (let d = start; d <= until && d <= rangeEnd; d = addDays(d, intervalWeeks * 7)) {
    if (d < rangeStart) continue;
    if (d.getDay() === startDow) {
      const dateStr = formatISODate(d);
      if (exceptionsSet.has(dateStr)) continue;
      occurrences.push({ ...event, id: `${event.id || 'new'}@${dateStr}`, date: dateStr });
    }
  }
  return occurrences;
}

function generateMonthly(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const occurrences: Event[] = [];
  const intervalMonths = Math.max(1, event.repeat.interval);
  const start = toDateOnly(new Date(event.date));
  const day = start.getDate();
  const until = event.repeat.endDate ? toDateOnly(new Date(event.repeat.endDate)) : rangeEnd;
  const exceptionsSet = getExceptionsSet(event.repeat);

  for (let d = new Date(start); d <= until && d <= rangeEnd; d = addMonths(d, intervalMonths)) {
    if (!monthHasDay(d, day)) continue; // skip months without the day (29/30/31 handled implicitly)
    const occurrenceDate = new Date(d.getFullYear(), d.getMonth(), day);
    if (occurrenceDate < rangeStart) continue;
    const dateStr = formatISODate(occurrenceDate);
    if (exceptionsSet.has(dateStr)) continue;
    occurrences.push({
      ...event,
      id: `${event.id || 'new'}@${dateStr}`,
      date: dateStr,
    });
  }
  return occurrences;
}

function generateYearly(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const occurrences: Event[] = [];
  const intervalYears = Math.max(1, event.repeat.interval);
  const start = toDateOnly(new Date(event.date));
  const month = start.getMonth();
  const day = start.getDate();
  const until = event.repeat.endDate ? toDateOnly(new Date(event.repeat.endDate)) : rangeEnd;
  const exceptionsSet = getExceptionsSet(event.repeat);

  for (let d = new Date(start); d <= until && d <= rangeEnd; d = addYears(d, intervalYears)) {
    const y = d.getFullYear();
    // Feb 29 special case: only in leap years
    if (month === 1 && day === 29 && !isLeapYear(y)) continue;
    const dim = getDaysInMonth(y, month + 1);
    if (day > dim) continue;
    const occurrenceDate = new Date(y, month, day);
    if (occurrenceDate < rangeStart) continue;
    const dateStr = formatISODate(occurrenceDate);
    if (exceptionsSet.has(dateStr)) continue;
    occurrences.push({
      ...event,
      id: `${event.id || 'new'}@${dateStr}`,
      date: dateStr,
    });
  }
  return occurrences;
}

export function expandEventsForRange(events: Event[], rangeStart: Date, rangeEnd: Date): Event[] {
  const expanded: Event[] = [];
  for (const event of events) {
    if (event.repeat?.type && event.repeat.type !== 'none') {
      if (event.repeat.type === 'daily') {
        expanded.push(...generateDaily(event, rangeStart, rangeEnd));
      } else if (event.repeat.type === 'weekly') {
        expanded.push(...generateWeekly(event, rangeStart, rangeEnd));
      } else if (event.repeat.type === 'monthly') {
        expanded.push(...generateMonthly(event, rangeStart, rangeEnd));
      } else if (event.repeat.type === 'yearly') {
        expanded.push(...generateYearly(event, rangeStart, rangeEnd));
      }
    } else {
      // non-repeating events included if in range
      const d = toDateOnly(new Date(event.date));
      if (d >= rangeStart && d <= rangeEnd) {
        expanded.push(event);
      }
    }
  }
  return expanded;
}
