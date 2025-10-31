// Month-end date validation for monthly recurring events
// 월간 반복 이벤트의 월말 날짜 검증

import { isLeapYear } from './isLeapYear';

// 월말 케이스 처리 (31일, 30일, 29일 등)
// 특별한 월말 날짜(29일 이상)인 경우만 true 반환
export function handleMonthEndCase(date: Date): boolean {
  if (!date) return false;

  const day = date.getDate();
  const month = date.getMonth(); // 0-based
  const year = date.getFullYear();

  // 29일 미만은 특별한 처리가 필요없으므로 false
  if (day < 29) return false;

  // 31일인 경우
  if (day === 31) {
    const monthsWithout31 = [1, 3, 5, 8, 10]; // 2월, 4월, 6월, 9월, 11월
    return !monthsWithout31.includes(month);
  }

  // 30일인 경우 (2월 체크)
  if (day === 30) {
    return month !== 1; // 2월이 아니면 유효
  }

  // 29일인 경우 (평년 2월 체크)
  if (day === 29 && month === 1) {
    return isLeapYear(year);
  }

  // 29일이지만 2월이 아닌 경우는 유효
  return true;
}
