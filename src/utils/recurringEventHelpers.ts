import { Event } from '../types';

/**
 * 반복 일정의 baseId를 추출합니다
 * @param eventId - 이벤트 ID (예: "123" 또는 "123_2025-10-15")
 * @returns baseId (예: "123")
 */
export function extractBaseId(eventId: string): string {
  return eventId.includes('_') ? eventId.split('_')[0] : eventId;
}

/**
 * baseId로 모든 반복 인스턴스를 찾습니다
 * @param events - 전체 이벤트 목록
 * @param baseId - 찾을 baseId
 * @returns 해당 baseId를 가진 모든 이벤트
 */
export function findRecurringInstances(events: Event[], baseId: string): Event[] {
  return events.filter((e) => extractBaseId(e.id) === baseId);
}
