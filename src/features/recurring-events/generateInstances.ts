import { RecurringInstance } from './types';
import { Event } from '../../types';

/**
 * 반복 일정에서 날짜별 인스턴스를 생성합니다.
 *
 * @param event - 반복 일정 이벤트
 * @param viewStartDate - 뷰의 시작 날짜 (YYYY-MM-DD)
 * @param viewEndDate - 뷰의 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜별 인스턴스 배열
 */
export function generateRecurringInstances(
  event: Event,
  viewStartDate: string,
  viewEndDate: string
): RecurringInstance[] {
  // TODO: 구현 필요
  // 1. 반복 패턴(daily, weekly, monthly, yearly)에 따라 날짜 생성
  // 2. 특수 날짜 처리 (31일, 윤년 2/29)
  // 3. 반복 종료일 검사
  return [];
}

/**
 * 특정 날짜가 반복 패턴에 유효한 날짜인지 확인합니다.
 *
 * @param date - 확인할 날짜 (YYYY-MM-DD)
 * @param originalDate - 원본 반복 시작 날짜
 * @returns 유효 여부
 */
export function isValidRecurringDate(date: string, originalDate: string): boolean {
  // TODO: 구현 필요
  // 1. 매월 31일 반복: 해당 월에 31일이 있는지 확인
  // 2. 매년 2/29 반복: 해당 년도가 윤년인지 확인
  return false;
}

/**
 * 윤년 여부를 확인합니다.
 *
 * @param year - 연도
 * @returns 윤년 여부
 */
export function isLeapYear(year: number): boolean {
  // TODO: 구현 필요
  return false;
}

/**
 * 특정 월의 마지막 날짜를 반환합니다.
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 마지막 날짜
 */
export function getDaysInMonth(year: number, month: number): number {
  // TODO: 구현 필요
  return 0;
}
