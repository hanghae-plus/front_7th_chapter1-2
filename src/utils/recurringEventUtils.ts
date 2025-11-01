import { Event, RepeatType } from '../types';
import { formatDate, getDaysInMonth } from './dateUtils';

/**
 * Generates recurring event instances within a date range.
 *
 * @param event - Master event with repeat configuration
 * @param rangeStart - Start date for instance generation (ISO format 'YYYY-MM-DD')
 * @param rangeEnd - End date for instance generation (ISO format 'YYYY-MM-DD')
 * @returns Array of event instances (does not include master definition)
 *
 * @throws {Error} If event is not a recurring event (repeat.type === 'none')
 *
 * @example
 * const master = {
 *   id: '1',
 *   title: 'Weekly Meeting',
 *   date: '2025-01-06',
 *   startTime: '09:00',
 *   endTime: '10:00',
 *   description: 'Team sync',
 *   location: 'Conference Room',
 *   category: 'Work',
 *   repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
 *   notificationTime: 10,
 *   isSeriesDefinition: true,
 *   seriesId: '1',
 *   excludedDates: ['2025-03-10']
 * };
 * const instances = generateRecurringEvents(master, '2025-01-01', '2025-01-31');
 * // Returns instances for Jan 6, 13, 20, 27 (excludes Mar 10 which is outside range)
 */
export function generateRecurringEvents(
  event: Event,
  rangeStart: string,
  rangeEnd: string
): Event[] {
  const instances: Event[] = [];
  const [originalYearStr, originalMonthStr, originalDayStr] = event.date.split('-');
  const originalYear = parseInt(originalYearStr, 10);
  const originalMonth = parseInt(originalMonthStr, 10);
  const originalDay = parseInt(originalDayStr, 10);

  let currentDate = event.date;
  let iterations = 0;
  const maxIterations = 10000; // Safety limit

  // For monthly/yearly, track occurrence count to maintain consistent intervals
  let occurrenceCount = 0;

  // Generate instances within range
  while (currentDate <= rangeEnd && iterations < maxIterations) {
    iterations++;

    // Check if within recurrence range
    if (isWithinRecurrenceRange(currentDate, event)) {
      // Check if within requested range
      if (currentDate >= rangeStart && currentDate <= rangeEnd) {
        // Check if date should be skipped (edge cases)
        if (!shouldSkipDate(currentDate, event.repeat.type, originalDay, originalMonth)) {
          // Create instance
          instances.push({
            ...event,
            date: currentDate,
            isSeriesDefinition: false,
            seriesId: event.id,
          });
        }
      }
    }

    // Move to next occurrence
    occurrenceCount++;
    currentDate = getNextOccurrence(
      event.date,
      event.repeat.type,
      event.repeat.interval * occurrenceCount,
      originalDay,
      originalMonth,
      originalYear
    );

    // Early exit if past recurrence end
    if (event.repeat.endDate && currentDate > event.repeat.endDate) {
      break;
    }
  }

  return instances;
}

/**
 * Calculates the next occurrence date for a recurring pattern.
 *
 * @param baseDate - Base date to calculate from (usually event.date) in ISO format 'YYYY-MM-DD'
 * @param repeatType - Type of recurrence (daily, weekly, monthly, yearly)
 * @param interval - Total number of periods from base (e.g., 2 means 2nd occurrence)
 * @param originalDay - Original day to maintain for monthly/yearly recurrence (optional)
 * @param originalMonth - Original month for yearly recurrence (optional)
 * @param originalYear - Original year for yearly recurrence (optional)
 * @returns Next occurrence date in ISO format 'YYYY-MM-DD'
 *
 * @throws {Error} If repeatType is 'none' or invalid
 *
 * @example
 * getNextOccurrence('2025-01-15', 'weekly', 1); // '2025-01-22'
 * getNextOccurrence('2025-01-15', 'weekly', 2); // '2025-01-29'
 * getNextOccurrence('2025-01-31', 'monthly', 1, 31); // '2025-02-31' -> rolls to '2025-03-03'
 */
export function getNextOccurrence(
  baseDate: string,
  repeatType: RepeatType,
  interval: number = 1,
  originalDay?: number,
  originalMonth?: number,
  originalYear?: number
): string {
  // Parse base date as local time to avoid timezone issues
  const [year, month, day] = baseDate.split('-').map(Number);
  let date = new Date(year, month - 1, day);

  switch (repeatType) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + interval * 7);
      break;
    case 'monthly':
      // For monthly recurrence, maintain the original day
      if (originalDay !== undefined) {
        // Calculate target month from base
        const targetMonth = month - 1 + interval; // 0-based month
        date = new Date(year, targetMonth, originalDay);
      } else {
        date.setMonth(date.getMonth() + interval);
      }
      break;
    case 'yearly':
      // For yearly recurrence, maintain the original month and day
      if (originalDay !== undefined && originalMonth !== undefined && originalYear !== undefined) {
        // Calculate target year from base
        const targetYear = originalYear + interval;
        date = new Date(targetYear, originalMonth - 1, originalDay);
      } else {
        date.setFullYear(date.getFullYear() + interval);
      }
      break;
    default:
      throw new Error(`Invalid repeat type: ${repeatType}`);
  }

  return formatDate(date);
}

/**
 * Determines if a date should be skipped for a given repeat type.
 * Handles edge cases like monthly 31st and yearly Feb 29.
 *
 * @param date - Date to check in ISO format 'YYYY-MM-DD'
 * @param repeatType - Type of recurrence
 * @param originalDay - Original day of month for monthly recurrence (optional, extracted from date if not provided)
 * @param originalMonth - Original month for yearly recurrence (optional)
 * @returns True if date should be skipped, false otherwise
 *
 * @example
 * shouldSkipDate('2025-02-31', 'monthly'); // true (Feb has no 31st)
 * shouldSkipDate('2025-02-29', 'yearly'); // true (2025 is not a leap year)
 * shouldSkipDate('2025-03-31', 'monthly'); // false (Mar has 31 days)
 * shouldSkipDate('2025-04-30', 'monthly', 30); // false (Apr has 30 days)
 */
export function shouldSkipDate(
  date: string,
  repeatType: RepeatType,
  originalDay?: number,
  originalMonth?: number
): boolean {
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // For monthly: skip if month doesn't have enough days OR if day doesn't match original
  if (repeatType === 'monthly') {
    const targetDay = originalDay || day;
    const daysInMonth = getDaysInMonth(year, month);

    // Skip if month doesn't have enough days for target day
    if (daysInMonth < targetDay) {
      return true;
    }

    // Skip if current day doesn't match target day (due to month overflow)
    if (day !== targetDay) {
      return true;
    }
  }

  // For yearly: skip Feb 29 in non-leap years, or dates that rolled over from Feb 29
  if (repeatType === 'yearly') {
    // If original date was Feb 29, we need special handling
    if (originalMonth === 2 && originalDay === 29) {
      // Skip non-leap years (will have rolled over to Mar 1)
      if (month === 3 && day === 1) {
        return true;
      }
      // Also skip Feb 29 in non-leap years (shouldn't happen but just in case)
      if (month === 2 && day === 29 && !isLeapYear(year)) {
        return true;
      }
    }

    // If originalMonth/Day not provided, check the date itself
    if (month === 2 && day === 29) {
      return !isLeapYear(year);
    }
  }

  return false;
}

/**
 * Checks if a date is within the recurrence range of an event.
 * Considers event start date, end date, and excluded dates.
 *
 * @param date - Date to check in ISO format 'YYYY-MM-DD'
 * @param event - Master event with repeat configuration
 * @returns True if date is within valid recurrence range
 *
 * @example
 * const event = {
 *   date: '2025-01-01',
 *   repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
 *   excludedDates: ['2025-01-15']
 * };
 * isWithinRecurrenceRange('2025-01-10', event); // true
 * isWithinRecurrenceRange('2025-01-15', event); // false (excluded)
 * isWithinRecurrenceRange('2025-02-01', event); // false (after endDate)
 */
export function isWithinRecurrenceRange(date: string, event: Event): boolean {
  // Check if date is before event start
  if (date < event.date) {
    return false;
  }

  // Check if date is after event end (if endDate exists)
  if (event.repeat.endDate && date > event.repeat.endDate) {
    return false;
  }

  // Check if date is in excludedDates
  if (event.excludedDates?.includes(date)) {
    return false;
  }

  return true;
}

/**
 * Checks if a year is a leap year.
 * Used for yearly Feb 29 edge case handling.
 *
 * A year is a leap year if:
 * - It is divisible by 4 AND
 * - (It is NOT divisible by 100 OR it IS divisible by 400)
 *
 * @param year - Year to check (e.g., 2024)
 * @returns True if leap year, false otherwise
 *
 * @example
 * isLeapYear(2024); // true (divisible by 4, not by 100)
 * isLeapYear(2025); // false (not divisible by 4)
 * isLeapYear(2000); // true (divisible by 400)
 * isLeapYear(1900); // false (divisible by 100 but not by 400)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
