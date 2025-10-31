// 특정 날짜를 건너뛸지 판단하는 로직
import { RepeatType } from '@/types/recurring/RepeatType.types';

export function shouldSkipRecurringDate(
  originalDay: number,
  originalMonth: number,
  currentDate: Date,
  type: RepeatType
): boolean {
  if (type === RepeatType.MONTHLY) {
    // 원래 날짜와 현재 날짜가 다르면 월말 처리로 변경된 것이므로 건너뛰기
    if (currentDate.getDate() !== originalDay) {
      return true;
    }
  }

  if (type === RepeatType.YEARLY) {
    // 윤년 2월 29일 매년 반복인데 평년인 경우 (2월 28일로 변경됨)
    if (
      originalMonth === 1 &&
      originalDay === 29 &&
      currentDate.getDate() === 28
    ) {
      return true;
    }
  }

  return false;
}
