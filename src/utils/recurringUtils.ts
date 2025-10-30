/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, RepeatInfo } from '../types';

/**
 * 반복 일정 설정을 바탕으로 날짜 배열을 생성합니다.
 * @param startDate - 반복 시작 날짜 (YYYY-MM-DD 형식)
 * @param repeat - 반복 설정 정보
 * @param endDate - 반복 종료 날짜 (YYYY-MM-DD 형식, 선택적)
 * @returns 생성된 날짜 배열 (YYYY-MM-DD 형식)
 */
export function generateRecurringDates(
  startDate: string,
  repeat: RepeatInfo,
  endDate?: string
): string[] {
  // TODO: 구현 필요
  return [];
}

/**
 * 반복 일정 설정이 유효한지 검증합니다.
 * @param startDate - 반복 시작 날짜
 * @param repeat - 반복 설정 정보
 * @param endDate - 반복 종료 날짜 (선택적)
 * @returns 유효성 검증 결과 { isValid: boolean, errorMessage?: string }
 */
export function validateRecurringConfig(
  startDate: string,
  repeat: RepeatInfo,
  endDate?: string
): { isValid: boolean; errorMessage?: string } {
  // TODO: 구현 필요
  return { isValid: false };
}

/**
 * 반복 일정을 단일 인스턴스로 분할합니다 (수정/삭제 시 사용).
 * @param event - 원본 반복 일정
 * @param targetDate - 수정/삭제할 날짜
 * @returns 분할된 일정 배열 { before?: Event, after?: Event }
 */
export function splitRecurringEvent(
  event: Event,
  targetDate: string
): { before?: Event; after?: Event } {
  // TODO: 구현 필요
  return {};
}

/**
 * 반복 정보를 사람이 읽을 수 있는 텍스트로 변환합니다.
 * @param repeat - 반복 설정 정보
 * @returns 반복 정보 텍스트 (예: "반복: 1일마다 (종료: 2025-01-07)")
 */
export function getRepeatText(repeat: RepeatInfo): string {
  // TODO: 구현 필요
  return '';
}

/**
 * 반복 일정을 날짜별 인스턴스로 전개합니다.
 * @param events - 일정 배열
 * @param rangeStart - 전개 시작 날짜
 * @param rangeEnd - 전개 종료 날짜
 * @returns 전개된 일정 배열
 */
export function expandRecurringEvents(events: Event[], rangeStart: Date, rangeEnd: Date): Event[] {
  // TODO: 구현 필요
  return [];
}

/**
 * 윤년 여부를 판별합니다.
 * @param year - 연도
 * @returns 윤년 여부
 */
export function isLeapYear(year: number): boolean {
  // TODO: 구현 필요
  return false;
}
