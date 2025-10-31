// Date matching validation for recurring events
// 반복 이벤트의 날짜 일치 검증

import { RepeatType } from '@/types/recurring/RepeatType.types';

// 기준 날짜와 대상 날짜가 반복 타입에 따라 일치하는지 확인
export function shouldCreateOnDate(
  baseDate: Date,
  targetDate: Date,
  type: RepeatType
): boolean {
  if (!baseDate || !targetDate) return false;

  switch (type) {
    case RepeatType.DAILY:
      return true; // 매일 반복은 모든 날짜에서 생성

    case RepeatType.WEEKLY:
      return baseDate.getDay() === targetDate.getDay(); // 같은 요일

    case RepeatType.MONTHLY:
      return baseDate.getDate() === targetDate.getDate(); // 같은 일

    case RepeatType.YEARLY:
      return (
        baseDate.getDate() === targetDate.getDate() &&
        baseDate.getMonth() === targetDate.getMonth()
      ); // 같은 월일

    default:
      return false;
  }
}
