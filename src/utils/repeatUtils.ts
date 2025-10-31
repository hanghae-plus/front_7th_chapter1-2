import { RepeatInfo, RepeatType } from '../types';

/**
 * 윤년 판별
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 반복 일정의 모든 날짜를 배열로 생성
 */
export function generateRepeatDates(baseDate: string, repeatInfo: RepeatInfo): string[] {
  if (repeatInfo.type === 'none') {
    return [];
  }

  const base = new Date(baseDate);
  if (isNaN(base.getTime())) {
    return [];
  }

  if (repeatInfo.interval <= 0) {
    return [];
  }

  const endDate = repeatInfo.endDate ? new Date(repeatInfo.endDate) : null;
  if (endDate && endDate < base) {
    return [];
  }

  const maxEndDate = endDate || new Date(base.getFullYear() + 2, base.getMonth(), base.getDate());
  const dates: string[] = [];
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();
  let currentYear = base.getFullYear();
  let currentMonth = base.getMonth();

  if (repeatInfo.type === 'monthly' && baseDay === 31) {
    while (true) {
      const testDate = new Date(currentYear, currentMonth, baseDay);
      if (testDate > maxEndDate) break;
      if (testDate.getDate() === 31) {
        dates.push(formatDate(testDate));
      }
      currentMonth += repeatInfo.interval;
      while (currentMonth >= 12) {
        currentMonth -= 12;
        currentYear++;
      }
    }
    return dates;
  }

  if (repeatInfo.type === 'monthly' && baseDay === 30) {
    while (true) {
      const testDate = new Date(currentYear, currentMonth, baseDay);
      if (testDate > maxEndDate) break;
      if (testDate.getDate() === 30) {
        dates.push(formatDate(testDate));
      }
      currentMonth += repeatInfo.interval;
      while (currentMonth >= 12) {
        currentMonth -= 12;
        currentYear++;
      }
    }
    return dates;
  }

  if (repeatInfo.type === 'yearly' && baseMonth === 1 && baseDay === 29) {
    while (true) {
      const testDate = new Date(currentYear, 1, 29);
      if (testDate > maxEndDate) break;
      if (isLeapYear(currentYear) && testDate.getDate() === 29) {
        dates.push(formatDate(testDate));
      }
      currentYear += repeatInfo.interval;
    }
    return dates;
  }

  let current = new Date(base);
  while (current <= maxEndDate) {
    dates.push(formatDate(current));
    const next = getNextRepeatDate(formatDate(current), repeatInfo.type, repeatInfo.interval);
    if (!next) {
      break;
    }
    current = new Date(next);
  }

  return dates;
}

/**
 * 현재 날짜로부터 다음 반복 날짜 계산
 */
export function getNextRepeatDate(
  currentDate: string,
  repeatType: RepeatType,
  interval: number
): string | null {
  if (repeatType === 'none') {
    return null;
  }

  const current = new Date(currentDate);
  if (isNaN(current.getTime())) {
    return null;
  }

  if (interval <= 0) {
    return null;
  }

  if (repeatType === 'daily') {
    current.setDate(current.getDate() + interval);
  } else if (repeatType === 'weekly') {
    current.setDate(current.getDate() + interval * 7);
  } else if (repeatType === 'monthly') {
    const originalDay = current.getDate();
    current.setMonth(current.getMonth() + interval);
    if (current.getDate() !== originalDay) {
      current.setDate(0);
    }
  } else if (repeatType === 'yearly') {
    const originalDay = current.getDate();
    const originalMonth = current.getMonth();
    current.setFullYear(current.getFullYear() + interval);
    if (current.getDate() !== originalDay || current.getMonth() !== originalMonth) {
      current.setDate(0);
    }
  }

  return formatDate(current);
}

/**
 * 31일 매월 반복 규칙 검증
 */
export function isValid31stMonthly(date: string): boolean {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return false;
  }

  const month = d.getMonth();
  const monthsWith31Days = [0, 2, 4, 6, 7, 9, 11];
  return monthsWith31Days.includes(month);
}

/**
 * 윤년 2월 29일 규칙 검증
 */
export function isValidLeapYearFeb29(date: string): boolean {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return false;
  }

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  return month === 1 && day === 29 && isLeapYear(year);
}

/**
 * 반복 정보를 사용자 친화적인 문자열로 변환
 */
export function formatRepeatInfo(repeatInfo: RepeatInfo): string {
  if (repeatInfo.type === 'none') {
    return '';
  }

  const typeLabels: Record<Exclude<RepeatType, 'none'>, string> = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };

  const intervalUnits: Record<Exclude<RepeatType, 'none'>, string> = {
    daily: '일',
    weekly: '주',
    monthly: '개월',
    yearly: '년',
  };

  const typeLabel = typeLabels[repeatInfo.type];
  const intervalText =
    repeatInfo.interval > 1 ? ` (${repeatInfo.interval}${intervalUnits[repeatInfo.type]}마다)` : '';
  const endDateText = repeatInfo.endDate ? ` ~ ${repeatInfo.endDate}` : '';

  return `${typeLabel}${intervalText}${endDateText}`;
}
