// 반복 일정 삭제 유틸리티 함수들
import { Event } from '@/types/events/Event.types';
import { DeletePermissions } from '@/types/recurring/DeleteTypes';

/**
 * 삭제 권한 검증
 * 반복 이벤트의 경우 확인 다이얼로그가 필요하며,
 * 과거 이벤트는 전체 삭제가 불가능함
 *
 * @param event 검증할 이벤트
 * @returns 삭제 권한 정보 (단일/전체 삭제 가능 여부, 확인 필요 여부)
 */
export const validateDeletePermissions = (event: Event): DeletePermissions => {
  const isRecurring = event.repeat.type !== 'none';

  // 현재 날짜와 이벤트 날짜를 비교 (날짜만, 시간 제외)
  const eventDate = new Date(event.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastEvent = eventDate < today;

  return {
    canDeleteSingle: true,
    canDeleteAll: isRecurring && !isPastEvent,
    requiresConfirmation: isRecurring,
  };
};

/**
 * 동일한 repeatId를 가진 모든 이벤트 조회
 * 반복 이벤트 그룹의 모든 인스턴스를 반환
 *
 * @param eventList 전체 이벤트 목록
 * @param repeatId 반복 ID (동일한 repeatId를 가진 이벤트들이 대상)
 * @returns 해당 repeatId를 가진 모든 이벤트
 */
export const getRecurringEventsByRepeatId = (
  eventList: Event[],
  repeatId: string | undefined
): Event[] => {
  if (!eventList || !repeatId) {
    return [];
  }

  return eventList.filter((event) => event.repeat.id === repeatId);
};

/**
 * 단일 이벤트 삭제
 * 지정된 ID의 이벤트만 제거
 *
 * @param eventList 전체 이벤트 목록
 * @param eventId 삭제할 이벤트 ID
 * @returns 삭제된 이벤트를 제외한 새로운 이벤트 목록
 */
export const deleteSingleEvent = (
  eventList: Event[],
  eventId: string
): Event[] => {
  if (!eventList) {
    return [];
  }

  return eventList.filter((event) => event.id !== eventId);
};

/**
 * 동일한 repeatId를 가진 모든 이벤트 삭제
 * 반복 이벤트 그룹의 모든 인스턴스를 제거
 *
 * @param eventList 전체 이벤트 목록
 * @param repeatId 반복 ID (동일한 repeatId를 가진 이벤트들이 대상)
 * @returns 해당 repeatId를 가진 이벤트들을 제외한 새로운 이벤트 목록
 */
export const deleteAllRecurringEvents = (
  eventList: Event[],
  repeatId: string
): Event[] => {
  if (!eventList || !repeatId) {
    return eventList || [];
  }

  return eventList.filter((event) => event.repeat.id !== repeatId);
};
