// Returns the number of days in a given month of a specific year.
// 주어진 년도와 월의 일수를 반환합니다.

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
