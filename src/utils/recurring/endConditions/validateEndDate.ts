// End date validation for recurring events
// 반복 이벤트의 종료 날짜 검증

import { isWithinMaxRange } from './isWithinMaxRange';

// 시작 날짜와 종료 날짜의 유효성 검증
export function validateEndDate(startDate: Date, endDate: Date): boolean {
  if (!startDate || !endDate) return false;

  // 종료 날짜는 시작 날짜보다 늦어야 함
  if (endDate <= startDate) return false;

  // 종료 날짜는 최대 허용 범위 내여야 함
  return isWithinMaxRange(endDate);
}
