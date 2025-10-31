// 시작 날짜에서 특정 간격만큼 떨어진 날짜 계산
import { isLeapYear } from '../dateCalculations/isLeapYear';

import { RepeatType } from '@/types/recurring/RepeatType.types';

export function calculateNextOccurrenceFromStart(
  startDate: Date,
  type: RepeatType,
  totalInterval: number
): Date {
  const nextDate = new Date(startDate);

  switch (type) {
    case RepeatType.DAILY:
      nextDate.setDate(nextDate.getDate() + totalInterval);
      break;

    case RepeatType.WEEKLY:
      nextDate.setDate(nextDate.getDate() + totalInterval * 7);
      break;

    case RepeatType.MONTHLY: {
      const originalDay = startDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + totalInterval);
      if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(0); // 이전 달의 마지막 날
      }
      break;
    }

    case RepeatType.YEARLY: {
      const originalMonth = startDate.getMonth();
      const originalDay = startDate.getDate();
      nextDate.setFullYear(nextDate.getFullYear() + totalInterval);
      if (
        originalMonth === 1 &&
        originalDay === 29 &&
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
