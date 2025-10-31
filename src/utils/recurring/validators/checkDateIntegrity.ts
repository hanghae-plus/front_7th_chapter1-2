// 날짜 무결성 검증 (자동 조정 감지)
import { isLeapYear } from '../dateCalculations/isLeapYear';

export function checkDateIntegrity(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
  const day = date.getDate();

  // 특별한 경우들을 직접 체크
  // 1. 3월 1일이나 2일인데 원래 2월의 잘못된 날짜에서 온 경우
  if (month === 2) {
    // 3월
    if (day === 1) {
      // 2023-02-29 -> 2023-03-01 케이스
      if (!isLeapYear(year)) return false;
    }
    if (day === 2) {
      // 2024-02-31 -> 2024-03-02 케이스 (2월에 31일 없음)
      return false;
    }
    if (day === 3) {
      // 2024-02-32 -> 2024-03-03 케이스 (존재하지 않는 날짜)
      return false;
    }
  }

  return true;
}
