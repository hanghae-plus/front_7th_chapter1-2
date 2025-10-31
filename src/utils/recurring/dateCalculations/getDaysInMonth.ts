// Days in month calculation utility
// 월별 일수 계산 유틸리티

// 특정 년월의 일수 계산 (month는 1-based)
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
