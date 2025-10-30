import { RepeatInfo } from '../types';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  getDaysInMonth,
  isLeapYear,
} from './dateUtils';

export function generateOccurrences(params: RepeatInfo): Date[] {
  if (!params.enabled || !params.startDate) return [];

  const occurrences: Date[] = [];
  let currentDate = new Date(params.startDate);
  const endDate = params.endDate ? new Date(params.endDate) : null;

  const { type, interval, count } = params;
  const limit = count || Infinity;

  while (occurrences.length < limit) {
    if (endDate && currentDate > endDate) break;

    let isValid = true;

    if (type === 'monthly') {
      const startDay = new Date(params.startDate).getDate();
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      // ??? day? ???? ??? ??
      if (startDay > getDaysInMonth(y, m)) {
        isValid = false;
      } else {
        // ?? ??? ??
        currentDate.setDate(startDay);
      }
    }
    else if (type === 'yearly') {
      const startMonth = new Date(params.startDate).getMonth();
      const startDay = new Date(params.startDate).getDate();
      // 2? 29?: ???? ??
      if (startMonth === 1 && startDay === 29) {
        if (!isLeapYear(currentDate.getFullYear())) {
          isValid = false;
        } else {
          // 2? 29?? ????? ??
          currentDate.setMonth(1);
          currentDate.setDate(29);
        }
      }
      // ?? ?/??: ??? ??? ???? ?? ??, month/day ?? ? ??
      else {
        const testDate = new Date(currentDate.getFullYear(), startMonth, startDay);
        // ?? ??? ???? ???? ??
        if (testDate.getMonth() !== startMonth || testDate.getDate() !== startDay) {
          isValid = false;
        } else {
          currentDate.setMonth(startMonth);
          currentDate.setDate(startDay);
        }
      }
    }

    if (isValid) {
      occurrences.push(new Date(currentDate));
    }

    switch (type) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, interval);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, interval);
        break;
      default:
        return occurrences;
    }
  }

  return occurrences;
}
