// Returns the month information of the given date in "YYYY년 M월" format.
// 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.

export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}
