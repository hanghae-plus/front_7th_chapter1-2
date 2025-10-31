// Leap year calculation utility
// 윤년 계산 유틸리티

// 윤년 판별
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
