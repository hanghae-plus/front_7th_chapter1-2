import { RepeatInfo } from '../../types';

interface GenerateRecurringDatesParams {
  startDate: string;
  repeat: RepeatInfo;
  /**
   * Optional override for the termination date; takes precedence over `repeat.endDate`.
   */
  endDate?: string;
  /**
   * Safety guard that caps how many instances will be generated.
   */
  maxOccurrences?: number;
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MAX_END_DATE_STRING = '2025-12-31';

const parseISODate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatUTCDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * MS_IN_DAY);

const addWeeks = (date: Date, weeks: number) => addDays(date, weeks * 7);

const getDaysInMonth = (year: number, month: number) => {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const getNextMonthlyOccurrence = (current: Date, interval: number, day: number) => {
  let monthsToAdd = interval;

  for (let guard = 0; guard < 240; guard++) {
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    const targetMonth = month + monthsToAdd;
    const candidate = new Date(Date.UTC(year, targetMonth, 1));

    const daysInMonth = getDaysInMonth(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1);
    if (day <= daysInMonth) {
      candidate.setUTCDate(day);
      return candidate;
    }

    monthsToAdd += 1;
  }

  return null;
};

const getNextYearlyOccurrence = (current: Date, interval: number, month: number, day: number) => {
  let yearsToAdd = interval;

  for (let guard = 0; guard < 400; guard++) {
    const candidateYear = current.getUTCFullYear() + yearsToAdd;
    const daysInTargetMonth = getDaysInMonth(candidateYear, month + 1);

    if (day <= daysInTargetMonth) {
      return new Date(Date.UTC(candidateYear, month, day));
    }

    yearsToAdd += 1;
  }

  return null;
};

export const generateRecurringDates = ({
  startDate,
  repeat,
  endDate,
  maxOccurrences = 100,
}: GenerateRecurringDatesParams) => {
  const { type, interval, endDate: repeatEndDate } = repeat;
  const maxEndDate = parseISODate(MAX_END_DATE_STRING);

  if (type === 'none') {
    return [startDate];
  }

  const occurrences: string[] = [];
  const start = parseISODate(startDate);
  occurrences.push(formatUTCDate(start));

  const limitDateString = endDate ?? repeatEndDate;
  let limitDate = maxEndDate;

  if (limitDateString) {
    const candidate = parseISODate(limitDateString);
    limitDate = candidate.getTime() > maxEndDate.getTime() ? maxEndDate : candidate;
  }

  let current = start;
  const startDay = start.getUTCDate();
  const startMonth = start.getUTCMonth();

  while (occurrences.length < maxOccurrences) {
    let next: Date | null = null;

    if (type === 'daily') {
      next = addDays(current, interval);
    } else if (type === 'weekly') {
      next = addWeeks(current, interval);
    } else if (type === 'monthly') {
      next = getNextMonthlyOccurrence(current, interval, startDay);
    } else if (type === 'yearly') {
      next = getNextYearlyOccurrence(current, interval, startMonth, startDay);
    }

    if (!next) {
      break;
    }

    if (next.getTime() > limitDate.getTime()) {
      break;
    }

    occurrences.push(formatUTCDate(next));
    current = next;
  }

  return occurrences;
};
