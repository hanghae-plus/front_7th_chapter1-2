// Date skipping logic for recurring events
// 반복 이벤트의 날짜 건너뛰기 로직

import { RepeatType } from '@/types/recurring/RepeatType.types';

// 윤년 판별 헬퍼 함수
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 특정 날짜를 건너뛸지 판단하는 헬퍼 함수
export function shouldSkipDate(
  originalDate: Date,
  nextDate: Date,
  type: RepeatType
): boolean {
  if (type === RepeatType.MONTHLY) {
    const originalDay = originalDate.getDate();
    const nextDay = nextDate.getDate();

    // 31일 매월 반복인데 31일이 없는 달인 경우
    if (originalDay === 31 && nextDay !== 31) {
      return true;
    }

    // 30일 매월 반복인데 2월인 경우
    if (originalDay === 30 && nextDate.getMonth() === 1) {
      return true;
    }

    // 29일 매월 반복인데 평년 2월인 경우
    if (
      originalDay === 29 &&
      nextDate.getMonth() === 1 &&
      !isLeapYear(nextDate.getFullYear())
    ) {
      return true;
    }
  }

  if (type === RepeatType.YEARLY) {
    const originalMonth = originalDate.getMonth();
    const originalDay = originalDate.getDate();
    const nextMonth = nextDate.getMonth();
    const nextDay = nextDate.getDate();

    // 윤년 2월 29일 매년 반복인데 평년인 경우
    if (
      originalMonth === 1 &&
      originalDay === 29 &&
      nextMonth === 1 &&
      nextDay === 28 &&
      !isLeapYear(nextDate.getFullYear())
    ) {
      return true;
    }
  }

  return false;
}
