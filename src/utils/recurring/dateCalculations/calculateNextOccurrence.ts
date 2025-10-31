// Next occurrence calculation for recurring events
// 반복 이벤트의 다음 발생 날짜 계산

import { isLeapYear } from './isLeapYear';

import { RepeatType } from '@/types/recurring/RepeatType.types';

// 다음 발생 날짜 계산
export function calculateNextOccurrence(
  date: Date,
  type: RepeatType,
  interval: number
): Date {
  if (!date || interval <= 0) {
    throw new Error('Invalid date or interval');
  }

  const nextDate = new Date(date);

  switch (type) {
    case RepeatType.DAILY:
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case RepeatType.WEEKLY:
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;

    case RepeatType.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;

    case RepeatType.YEARLY: {
      // 원본 날짜 저장
      const originalMonth = nextDate.getMonth();
      const originalDayOfYear = nextDate.getDate();

      nextDate.setFullYear(nextDate.getFullYear() + interval);

      // 윤년 케이스 처리: 2월 29일이 평년이면 2월 28일로 조정
      if (
        originalMonth === 1 &&
        originalDayOfYear === 29 &&
        !isLeapYear(nextDate.getFullYear())
      ) {
        nextDate.setDate(28);
      }
      break;
    }

    default:
      throw new Error('Invalid repeat type');
  }

  return nextDate;
}
