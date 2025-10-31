// Leap year date validation for yearly recurring events
// 연간 반복 이벤트의 윤년 날짜 검증

import { isLeapYear } from './isLeapYear';

// 윤년 케이스 처리 (2월 29일)
// 2월 29일인 경우만 특별한 처리가 필요하므로 해당 경우만 true 반환
export function handleLeapYearCase(date: Date): boolean {
  if (!date) return false;

  const day = date.getDate();
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();

  // 2월 29일인 경우에만 윤년 케이스로 true 반환
  if (month === 1 && day === 29) {
    return isLeapYear(year);
  }

  // 2월 29일이 아닌 경우는 특별한 처리가 필요없으므로 false
  return false;
}
