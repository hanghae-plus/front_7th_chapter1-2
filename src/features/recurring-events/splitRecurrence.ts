import { Event } from '../../types';
import { SplitRecurringResult } from './types';

/**
 * 반복 일정을 분할합니다. (단일 수정/삭제 시 사용)
 * 
 * @param event - 원본 반복 일정
 * @param targetDate - 수정/삭제할 날짜 (YYYY-MM-DD)
 * @param modifiedEvent - 수정된 이벤트 (수정 시에만 제공)
 * @returns 분할된 일정들
 */
export function splitRecurringEvent(
  event: Event,
  targetDate: string,
  modifiedEvent?: Partial<Event>
): SplitRecurringResult {
  // TODO: 구현 필요
  // 1. targetDate 이전의 마지막 반복 날짜 계산
  // 2. before: 원본 일정의 endDate를 이전 반복 날짜로 설정
  // 3. modified: 수정된 내용으로 단일 일정 생성 (repeat.type = 'none')
  // 4. after: targetDate 이후 첫 반복 날짜부터 시작하는 새 반복 일정
  // 5. 모든 일정의 repeatGroupId는 원본과 동일하게 유지
  return {};
}

/**
 * 특정 날짜의 이전 반복 날짜를 계산합니다.
 * 
 * @param startDate - 반복 시작 날짜
 * @param targetDate - 기준 날짜
 * @param repeatType - 반복 유형
 * @param interval - 반복 간격
 * @returns 이전 반복 날짜 (YYYY-MM-DD)
 */
export function getPreviousRecurringDate(
  startDate: string,
  targetDate: string,
  repeatType: string,
  interval: number
): string | null {
  // TODO: 구현 필요
  return null;
}

/**
 * 특정 날짜의 다음 반복 날짜를 계산합니다.
 * 
 * @param startDate - 반복 시작 날짜
 * @param targetDate - 기준 날짜
 * @param repeatType - 반복 유형
 * @param interval - 반복 간격
 * @returns 다음 반복 날짜 (YYYY-MM-DD)
 */
export function getNextRecurringDate(
  startDate: string,
  targetDate: string,
  repeatType: string,
  interval: number
): string | null {
  // TODO: 구현 필요
  return null;
}

