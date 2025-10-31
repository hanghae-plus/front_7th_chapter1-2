// Maximum range validation for recurring events
// 반복 이벤트의 최대 범위 검증

import { getMaxEndDate } from './getMaxEndDate';

// 날짜가 최대 허용 범위(2025-12-31) 내에 있는지 확인
export function isWithinMaxRange(date: Date): boolean {
  if (!date) return false;

  const maxDate = getMaxEndDate();
  return date <= maxDate;
}
