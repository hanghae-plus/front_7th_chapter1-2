import { RepeatInfo, RepeatType } from '../types';

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Validates repeat information
 * @param startDate Start date in YYYY-MM-DD format
 * @param repeatInfo Repeat configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateRepeatInfo(startDate: string, repeatInfo: RepeatInfo): ValidationResult {
  // Validate interval
  if (repeatInfo.interval < 1 || repeatInfo.interval > 1000) {
    return {
      valid: false,
      error: '반복 간격은 1 이상 1000 이하여야 합니다',
    };
  }

  // If no endDate, validation passes
  if (!repeatInfo.endDate) {
    return { valid: true, error: null };
  }

  // Validate endDate format
  if (!isValidDateFormat(repeatInfo.endDate)) {
    return {
      valid: false,
      error: '반복 종료일 형식이 잘못되었습니다 (YYYY-MM-DD)',
    };
  }

  // Validate that endDate is after startDate
  if (repeatInfo.endDate < startDate) {
    return {
      valid: false,
      error: '반복 종료일은 시작일 이후여야 합니다',
    };
  }

  return { valid: true, error: null };
}

/**
 * Checks if a date string is in valid YYYY-MM-DD format
 */
function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const parts = dateString.split('-').map(Number);
  const month = parts[1];
  const day = parts[2];

  // Basic range checks
  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  // More precise day validation
  const date = new Date(dateString);
  return date.toISOString().startsWith(dateString);
}

/**
 * Generates all recurring dates for a given repeat configuration
 * @param startDate Start date in YYYY-MM-DD format
 * @param repeatType Type of repetition (daily, weekly, monthly, yearly)
 * @param interval Repetition interval (how many units between occurrences)
 * @param endDate Optional end date in YYYY-MM-DD format
 * @returns Array of dates in YYYY-MM-DD format
 */
export function generateRecurringDates(
  startDate: string,
  repeatType: RepeatType,
  interval: number,
  endDate?: string
): string[] {
  if (repeatType === 'none') {
    return [startDate];
  }

  const dates: string[] = [startDate];

  // Parse start date and end date properly
  const startParts = startDate.split('-').map(Number);
  const originalDay = startParts[2]; // Keep the original day
  let year = startParts[0];
  let month = startParts[1];
  let day = startParts[2];

  const endDateObj = endDate ? new Date(`${endDate}T00:00:00Z`) : null;
  const maxInstances = 1000;

  while (dates.length < maxInstances) {
    // Calculate next occurrence based on type
    if (repeatType === 'daily') {
      day += interval;
      // Handle day overflow
      while (day > getDaysInMonth(year, month)) {
        day -= getDaysInMonth(year, month);
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
    } else if (repeatType === 'weekly') {
      day += interval * 7;
      // Handle day overflow
      while (day > getDaysInMonth(year, month)) {
        day -= getDaysInMonth(year, month);
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
    } else if (repeatType === 'monthly') {
      month += interval;
      // Handle month overflow
      while (month > 12) {
        month -= 12;
        year++;
      }
      // Handle day overflow for target month - reset to original day first, then adjust if needed
      const maxDay = getDaysInMonth(year, month);
      day = Math.min(originalDay, maxDay);
    } else if (repeatType === 'yearly') {
      year += interval;
      // Handle Feb 29 in non-leap years
      if (month === 2 && originalDay === 29) {
        if (!isLeapYear(year)) {
          day = 28;
        } else {
          day = 29;
        }
      }
    }

    const nextDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const nextDate = new Date(`${nextDateString}T00:00:00Z`);

    // Check if we've exceeded the end date
    if (endDateObj && nextDate > endDateObj) {
      break;
    }

    dates.push(nextDateString);

    // If endDate is specified and we've reached it, stop
    if (endDateObj && nextDateString === endDate) {
      break;
    }
  }

  return dates;
}

/**
 * Get number of days in a given month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Check if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * Note: This creates a UTC date to avoid timezone issues
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
