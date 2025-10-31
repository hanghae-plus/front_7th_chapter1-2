// 특정 반복 타입에서 날짜 유효성 검증
import { isLeapYear } from '../dateCalculations/isLeapYear';

import { RepeatType } from '@/types/recurring/RepeatType.types';

export function isValidDateForType(date: Date, type: RepeatType): boolean {
  const day = date.getDate();
  const month = date.getMonth(); // 0-based

  switch (type) {
    case RepeatType.DAILY:
    case RepeatType.WEEKLY:
      return true; // 매일, 매주는 모든 날짜 유효

    case RepeatType.MONTHLY:
      return isValidForMonthlyRepeat(day, month);

    case RepeatType.YEARLY:
      return isValidForYearlyRepeat(day, month, date.getFullYear());

    default:
      return false;
  }
}

function isValidForMonthlyRepeat(day: number, month: number): boolean {
  // 31일 매월 반복 - 31일이 없는 달 확인
  if (day === 31) {
    // 31일이 없는 달: 2월(1), 4월(3), 6월(5), 9월(8), 11월(10)
    const monthsWithout31 = [1, 3, 5, 8, 10];
    return !monthsWithout31.includes(month);
  }
  // 30일 매월 반복 - 2월 확인
  if (day === 30) {
    return month !== 1; // 2월이 아니면 유효
  }
  // 29일 매월 반복 - 평년 2월 확인
  if (day === 29 && month === 1) {
    return isLeapYear(new Date().getFullYear()); // 현재 연도 기준
  }
  return true;
}

function isValidForYearlyRepeat(
  day: number,
  month: number,
  year: number
): boolean {
  // 윤년 2월 29일 매년 반복 - 윤년에서만 유효
  if (month === 1 && day === 29) {
    return isLeapYear(year);
  }
  return true;
}
