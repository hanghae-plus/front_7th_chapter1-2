import { RepeatInfo } from '../types';
import { addDays, addMonths, addWeeks, addYears, getDaysInMonth, isLeapYear } from './dateUtils';

export function generateOccurrences(params: RepeatInfo): Date[] {
  if (params.type === 'none' || !params.startDate) return [];

  const occurrences: Date[] = [];
  let currentDate = new Date(params.startDate);

  // Derive an effective end date for special edge cases
  // - For yearly 2/29 with count-based generation and no explicit endDate,
  //   cap the search horizon to start + 6 years to avoid scanning far future years.
  const startDateObj = new Date(params.startDate);
  const isLeapDayStart = startDateObj.getMonth() === 1 && startDateObj.getDate() === 29;

  // Safety limit: prevent infinite loops when neither count nor endDate is provided
  const MAX_OCCURRENCES = 10000;
  const DEFAULT_HORIZON_YEARS = 10;

  const effectiveEndDate = (() => {
    if (params.endDate) return new Date(params.endDate);
    if (params.type === 'yearly' && isLeapDayStart && params.count && !params.endDate) {
      const d = new Date(startDateObj);
      d.setFullYear(d.getFullYear() + 6); // inclusive window up to ~6 years
      return d;
    }
    // Safety: if neither count nor endDate, set a reasonable default horizon
    if (!params.count && !params.endDate) {
      const d = new Date(startDateObj);
      d.setFullYear(d.getFullYear() + DEFAULT_HORIZON_YEARS);
      return d;
    }
    return null;
  })();

  const { type, interval, count } = params;
  const limit = count || MAX_OCCURRENCES;

  // Additional safety: prevent infinite loops with max iteration counter
  const MAX_ITERATIONS = MAX_OCCURRENCES * 2; // Allow some invalid dates
  let iterations = 0;

  while (occurrences.length < limit && iterations < MAX_ITERATIONS) {
    iterations++;

    if (effectiveEndDate && currentDate > effectiveEndDate) break;

    let isValid = true;

    if (type === 'monthly') {
      const startDay = new Date(params.startDate).getDate();
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      // 해당 day가 현재 월에 없으면 스킵
      if (startDay > getDaysInMonth(y, m)) {
        isValid = false;
      } else {
        // 날짜 맞춰 설정
        currentDate.setDate(startDay);
      }
    } else if (type === 'yearly') {
      const startMonth = new Date(params.startDate).getMonth();
      const startDay = new Date(params.startDate).getDate();
      // 2월 29일: 윤년만 유효
      if (startMonth === 1 && startDay === 29) {
        if (!isLeapYear(currentDate.getFullYear())) {
          isValid = false;
        } else {
          // 2월 29일로 명시적 설정
          currentDate.setMonth(1);
          currentDate.setDate(29);
        }
      }
      // 다른 월/일: 현재 연도에서 해당 날짜가 유효한지 확인, month/day 맞춰 셋팅
      else {
        const testDate = new Date(currentDate.getFullYear(), startMonth, startDay);
        // 해당 날짜가 실제로 존재하지 않으면 스킵
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
