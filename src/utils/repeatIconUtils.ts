// Ai Edit
import { Event } from '../types';

/**
 * 🔁 반복 일정 아이콘 표시 여부를 판단하는 함수
 * @param event 검사할 이벤트
 * @returns 반복 아이콘을 표시해야 하면 true, 아니면 false
 */
export function shouldShowRepeatIcon(event: Event): boolean {
  // Ai Edit: 서버(/api/events-list)에서는 repeat.id를 사용, 클라이언트 생성은 repeatGroupId 사용
  // isRepeatInstance가 true인 경우도 반복 인스턴스로 간주
  const hasServerRepeatId = (event as any)?.repeat?.id;
  const hasClientRepeatGroup = event.repeatGroupId;
  const isInstance = (event as any)?.isRepeatInstance;
  return (Boolean(hasServerRepeatId) || Boolean(hasClientRepeatGroup) || Boolean(isInstance)) && event.repeat.type !== 'none';
}

/**
 * 🔁 반복 일정 아이콘 문자열을 반환하는 함수
 * @param event 검사할 이벤트
 * @returns 반복 아이콘 문자열 또는 빈 문자열
 */
export function getRepeatIcon(event: Event): string {
  return shouldShowRepeatIcon(event) ? ' 🔁' : '';
}

