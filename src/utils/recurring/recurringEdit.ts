// 반복 일정 수정 유틸리티 함수들
import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';
import { EditPermissions, EditOption } from '@/types/recurring/EditTypes';

/**
 * 반복 이벤트를 단일 이벤트로 변환
 * 반복 정보를 제거하여 독립적인 단일 이벤트로 만듦
 *
 * @param event 변환할 반복 이벤트
 * @returns 단일 이벤트로 변환된 이벤트 (repeat.type = 'none')
 * @throws {Error} 이벤트가 제공되지 않은 경우
 */
export const convertToSingleEvent = (event: Event): Event => {
  if (!event) {
    throw new Error('이벤트가 제공되지 않았습니다');
  }

  return {
    ...event,
    repeat: {
      type: 'none',
      interval: 0,
    },
  };
};

/**
 * 동일한 repeatId를 가진 모든 이벤트 업데이트
 * 반복 이벤트 그룹의 모든 인스턴스에 동일한 변경사항 적용
 *
 * @param eventList 전체 이벤트 목록
 * @param repeatId 반복 ID (동일한 repeatId를 가진 이벤트들이 대상)
 * @param updatedData 업데이트할 데이터 (부분 업데이트 지원)
 * @returns 업데이트된 이벤트 목록 (해당 없으면 원본 반환)
 */
export const updateAllRecurringEvents = (
  eventList: Event[],
  repeatId: string,
  updatedData: Partial<EventForm>
): Event[] => {
  // 빈 업데이트 데이터인 경우 원본 반환
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return eventList;
  }

  // 해당 repeatId를 가진 이벤트가 없는 경우 원본 반환
  const hasMatchingEvents = eventList.some(
    (event) => event.repeat.id === repeatId
  );
  if (!hasMatchingEvents) {
    return eventList;
  }

  return eventList.map((event) =>
    event.repeat.id === repeatId ? { ...event, ...updatedData } : event
  );
};

/**
 * 반복 아이콘 업데이트
 * 단일 수정 시 해당 이벤트의 반복 표시를 제거
 *
 * @param eventList 전체 이벤트 목록
 * @param eventId 대상 이벤트 ID
 * @param editType 편집 타입 ('single' | 'all')
 * @returns 아이콘이 업데이트된 이벤트 목록
 */
export const updateRecurringIcon = (
  eventList: Event[],
  eventId: string,
  editType: EditOption
): Event[] => {
  return eventList.map((event) => {
    if (event.id === eventId && editType === 'single') {
      // 단일 수정 시 해당 이벤트의 반복 정보 제거
      return {
        ...event,
        repeat: { type: 'none', interval: 0 },
      };
    }
    return event;
  });
};

/**
 * 편집 권한 검증
 * 반복 이벤트의 경우 확인 다이얼로그가 필요하며,
 * 과거 이벤트는 전체 수정이 불가능함
 *
 * @param event 검증할 이벤트
 * @returns 편집 권한 정보 (단일/전체 수정 가능 여부, 확인 필요 여부)
 */
export const validateEditPermissions = (event: Event): EditPermissions => {
  const isRecurring = event.repeat.type !== 'none';

  // 현재 날짜와 이벤트 날짜를 비교 (날짜만, 시간 제외)
  const eventDate = new Date(event.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastEvent = eventDate < today;

  return {
    canEditSingle: true,
    canEditAll: isRecurring && !isPastEvent,
    requiresConfirmation: isRecurring,
  };
};
