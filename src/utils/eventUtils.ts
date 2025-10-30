import { Event } from '../types';
import { getDaysInMonth, getWeekDates, isDateInRange } from './dateUtils';

// function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
//   return events.filter((event) => {
//     const eventDate = new Date(event.date);
//     return isDateInRange(eventDate, start, end);
//   });
// }

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

// function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
//   const weekDates = getWeekDates(currentDate);
//   return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
// }

// function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
//   const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//   const monthEnd = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() + 1,
//     0,
//     23,
//     59,
//     59,
//     999
//   );
//   return filterEventsByDateRange(events, monthStart, monthEnd);
// }

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  // Compute range by view
  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === 'week') {
    const weekDates = getWeekDates(currentDate);
    rangeStart = new Date(
      weekDates[0].getFullYear(),
      weekDates[0].getMonth(),
      weekDates[0].getDate()
    );
    rangeEnd = new Date(
      weekDates[6].getFullYear(),
      weekDates[6].getMonth(),
      weekDates[6].getDate(),
      23,
      59,
      59,
      999
    );
  } else {
    rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return expandRecurringEvents(searchedEvents, rangeStart, rangeEnd);
}

// --- Recurrence Expansion ---

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

function addMonthsKeepingDay(base: Date, monthsToAdd: number): Date | null {
  const targetYear = base.getFullYear();
  const targetMonthIndex = base.getMonth() + monthsToAdd; // may overflow
  const baseDay = base.getDate();
  const y = Math.floor(targetYear + targetMonthIndex / 12);
  const mIndex = ((targetMonthIndex % 12) + 12) % 12; // 0-11
  const daysInTarget = getDaysInMonth(y, mIndex + 1);
  if (baseDay > daysInTarget) {
    return null; // skip months without this day (e.g., 31st)
  }
  return new Date(y, mIndex, baseDay);
}

function addYearsKeepingDay(base: Date, yearsToAdd: number): Date | null {
  const y = base.getFullYear() + yearsToAdd;
  const mIndex = base.getMonth();
  const baseDay = base.getDate();
  const daysInTarget = getDaysInMonth(y, mIndex + 1);
  if (baseDay > daysInTarget) {
    return null; // handles Feb 29 on non-leap years
  }
  return new Date(y, mIndex, baseDay);
}

function clampRangeEndByRepeatEnd(rangeEnd: Date, repeatEndDate?: string): Date {
  if (!repeatEndDate) return rangeEnd;
  const repeatEnd = new Date(repeatEndDate);
  const atEndOfRepeatDay = new Date(
    repeatEnd.getFullYear(),
    repeatEnd.getMonth(),
    repeatEnd.getDate(),
    23,
    59,
    59,
    999
  );
  return atEndOfRepeatDay < rangeEnd ? atEndOfRepeatDay : rangeEnd;
}

function expandRecurringEvents(events: Event[], rangeStart: Date, rangeEnd: Date): Event[] {
  const results: Event[] = [];

  const msPerDay = 24 * 60 * 60 * 1000;

  for (const event of events) {
    const baseDate = startOfDay(new Date(event.date));
    const effectiveRangeEnd = clampRangeEndByRepeatEnd(rangeEnd, event.repeat.endDate);

    if (event.repeat.type === 'none') {
      if (isDateInRange(baseDate, rangeStart, effectiveRangeEnd)) {
        results.push(event);
      }
      continue;
    }

    const interval = Math.max(1, event.repeat.interval || 1);

    switch (event.repeat.type) {
      case 'daily': {
        // Find the first occurrence on or after rangeStart
        const diffDays = Math.ceil(
          (startOfDay(rangeStart).getTime() - baseDate.getTime()) / msPerDay
        );
        const steps = Math.max(0, Math.ceil(diffDays / interval));
        let current = addDays(baseDate, steps * interval);
        while (current <= effectiveRangeEnd) {
          if (current >= rangeStart) {
            const dateStr = toDateString(current);
            const isExcluded = event.repeat.exceptions?.includes(dateStr);
            if (!isExcluded) {
              results.push({ ...event, date: dateStr });
            }
          }
          current = addDays(current, interval);
        }
        break;
      }
      case 'weekly': {
        const diffDays = Math.ceil(
          (startOfDay(rangeStart).getTime() - baseDate.getTime()) / msPerDay
        );
        const weeksDiff = Math.ceil(diffDays / 7);
        const steps = Math.max(0, Math.ceil(weeksDiff / interval));
        let current = addWeeks(baseDate, steps * interval);
        while (current <= effectiveRangeEnd) {
          if (current >= rangeStart) {
            const dateStr = toDateString(current);
            const isExcluded = event.repeat.exceptions?.includes(dateStr);
            if (!isExcluded) {
              results.push({ ...event, date: dateStr });
            }
          }
          current = addWeeks(current, interval);
        }
        break;
      }
      case 'monthly': {
        // Determine starting step k such that candidate >= rangeStart
        const monthsBetween =
          (rangeStart.getFullYear() - baseDate.getFullYear()) * 12 +
          (rangeStart.getMonth() - baseDate.getMonth());
        let k = Math.max(0, Math.ceil(monthsBetween / interval));
        while (true) {
          const candidate = addMonthsKeepingDay(baseDate, k * interval);
          if (candidate && candidate >= rangeStart && candidate <= effectiveRangeEnd) {
            const dateStr = toDateString(candidate);
            const isExcluded = event.repeat.exceptions?.includes(dateStr);
            if (!isExcluded) {
              results.push({ ...event, date: dateStr });
            }
          }
          if (candidate && candidate > effectiveRangeEnd) break;
          // if candidate is null (e.g., 31st in a short month), skip to next step
          // also break if even the month (ignoring day) exceeds rangeEnd
          const roughMonth = new Date(baseDate);
          roughMonth.setMonth(baseDate.getMonth() + k * interval);
          if (roughMonth > effectiveRangeEnd) break;
          k += 1;
        }
        break;
      }
      case 'yearly': {
        const yearsBetween = rangeStart.getFullYear() - baseDate.getFullYear();
        let k = Math.max(0, Math.ceil(yearsBetween / interval));
        while (true) {
          const candidate = addYearsKeepingDay(baseDate, k * interval);
          if (candidate && candidate >= rangeStart && candidate <= effectiveRangeEnd) {
            const dateStr = toDateString(candidate);
            const isExcluded = event.repeat.exceptions?.includes(dateStr);
            if (!isExcluded) {
              results.push({ ...event, date: dateStr });
            }
          }
          if (candidate && candidate > effectiveRangeEnd) break;
          const roughYear = new Date(baseDate);
          roughYear.setFullYear(baseDate.getFullYear() + k * interval);
          if (roughYear > effectiveRangeEnd) break;
          k += 1;
        }
        break;
      }
    }
  }

  return results;
}
